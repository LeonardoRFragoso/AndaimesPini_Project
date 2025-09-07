from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.locacoes_routes import locacoes_routes
from routes.clientes_routes import clientes_routes
from routes.inventario_routes import inventario_routes
from routes.reports_routes import reports_bp
from routes.itens_locados_routes import itens_locados_routes
from routes.damages_routes import damages_routes
from routes.notificacoes_routes import notificacoes_routes
from routes.auth_routes import auth_routes, requer_autenticacao
from database import create_tables, close_all_connections
import logging
import atexit

# Criação da aplicação Flask
app = Flask(__name__)

# Desabilitar redirecionamento de URLs com/sem barra final
app.url_map.strict_slashes = False

# Configuração do ambiente: "development" ou "production"
ENVIRONMENT = "development"

# Configuração do logger com base no ambiente
logging.basicConfig(
    level=logging.DEBUG if ENVIRONMENT == "development" else logging.INFO,
    format="%(asctime)s [%(levelname)s]: %(message)s",
)
logger = logging.getLogger(__name__)

# Configuração de CORS
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True, "allow_headers": ["Content-Type", "Authorization"], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]}})


# Função para inicializar o banco de dados ao iniciar a aplicação
def inicializar_banco():
    try:
        create_tables()
        logger.info("Tabelas verificadas/criadas com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao criar/verificar tabelas: {e}")

# Middleware para registrar informações das requisições
@app.before_request
def log_request_info():
    logger.debug(f"Requisição recebida: {request.method} {request.url}")
    if request.method in ["POST", "PUT", "DELETE"]:
        data = request.get_json(silent=True)
        if data:
            logger.debug(f"Dados recebidos: {data}")
        else:
            logger.debug("Nenhum dado recebido.")

# Configuração do after_request para adicionar cabeçalhos de CORS
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    return response

# Rota OPTIONS para lidar com preflight CORS
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

# Registrar os blueprints para rotas modularizadas
try:
    # Registrar rotas de autenticação (não requerem autenticação)
    app.register_blueprint(auth_routes)
    
    # Registrar rotas protegidas (requerem autenticação)
    app.register_blueprint(locacoes_routes, url_prefix='/locacoes')
    app.register_blueprint(clientes_routes, url_prefix='/clientes')
    app.register_blueprint(itens_locados_routes, url_prefix='/itens-locados')
    app.register_blueprint(inventario_routes, url_prefix='/inventario')
    app.register_blueprint(reports_bp, url_prefix='/reports')
    app.register_blueprint(damages_routes, url_prefix='/danos')
    app.register_blueprint(notificacoes_routes, url_prefix='/notificacoes')
    logger.info("Rotas registradas com sucesso.")
except Exception as e:
    logger.error(f"Erro ao registrar rotas: {e}")

# Middleware para proteção de rotas (exceto rotas de autenticação)
@app.before_request
def proteger_rotas():
    # Lista de rotas que não requerem autenticação
    rotas_publicas = [
        '/auth/login',
        '/auth/verificar',
        '/clientes',
        '/inventario',
        '/inventario/disponiveis',
        '/locacoes',
        '/notificacoes',
        '/notificacoes/nao-lidas',
        '/notificacoes/gerar-automaticas'
    ]
    
    # Verificar se é uma requisição OPTIONS (CORS preflight)
    if request.method == 'OPTIONS':
        return None
        
    # Verificar se a rota atual requer autenticação
    for rota in rotas_publicas:
        if request.path.startswith(rota):
            return None
            
    if not request.path.startswith('/static/'):
        # Aplicar o decorador de autenticação
        return requer_autenticacao(lambda: None)()
    return None

# Middleware para tratar erros de requisição
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Erro durante a requisição: {e}")
    return jsonify({"error": "Erro interno no servidor, tente novamente mais tarde."}), 500

# Função para fechar o pool de conexões ao encerrar a aplicação
def fechar_conexoes():
    try:
        close_all_connections()
        logger.info("Pool de conexões fechado com sucesso ao encerrar a aplicação.")
    except Exception as e:
        logger.error(f"Erro ao fechar o pool de conexões: {e}")

# Configura o fechamento do pool de conexões quando a aplicação for encerrada
atexit.register(fechar_conexoes)

# Função principal para rodar a aplicação
if __name__ == "__main__":
    inicializar_banco()
    try:
        logger.info(f"Iniciando a aplicação Flask no ambiente '{ENVIRONMENT}'...")
        app.run(
            debug=(ENVIRONMENT == "development"),
            host="0.0.0.0",
            port=5000,
            use_reloader=False
        )
    except Exception as e:
        logger.error(f"Erro ao iniciar a aplicação: {e}")
