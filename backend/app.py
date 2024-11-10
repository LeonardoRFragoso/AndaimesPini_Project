from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.rotas_locacoes import locacoes_routes
from routes.rotas_clientes import clientes_routes
from routes.inventario_routes import inventario_routes
from routes.reports_routes import reports_bp
from routes.rotas_itens_locados import itens_locados_routes
from routes.damages_routes import damages_routes
from database import create_tables, close_all_connections
import logging
import atexit

# Criação da aplicação Flask
app = Flask(__name__)

# Configuração do ambiente: "development" ou "production"
ENVIRONMENT = "development"

# Configuração do logger com base no ambiente
logging.basicConfig(
    level=logging.DEBUG if ENVIRONMENT == "development" else logging.INFO,
    format="%(asctime)s [%(levelname)s]: %(message)s",
)
logger = logging.getLogger(__name__)

# Configuração de CORS
if ENVIRONMENT == "development":
    CORS(app, resources={r"/*": {"origins": "*"}})
else:
    CORS(app, resources={r"/*": {"origins": ["https://seu-dominio.com"]}})

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
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    return response

# Registrar os blueprints para rotas modularizadas
try:
    app.register_blueprint(locacoes_routes, url_prefix='/locacoes')
    app.register_blueprint(clientes_routes, url_prefix='/clientes')
    app.register_blueprint(itens_locados_routes, url_prefix='/itens-locados')
    app.register_blueprint(inventario_routes, url_prefix='/inventario')
    app.register_blueprint(reports_bp, url_prefix='/reports')
    app.register_blueprint(damages_routes, url_prefix='/danos')
    logger.info("Rotas registradas com sucesso.")
except Exception as e:
    logger.error(f"Erro ao registrar rotas: {e}")

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
