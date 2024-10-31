from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import main_routes
from routes.locacoes_routes import locacoes_routes
from routes.clientes_routes import clientes_routes
from routes.inventario_routes import inventario_routes
from routes.reports_routes import reports_bp  # Importando o Blueprint correto de relatórios
from database import create_tables, close_all_connections
import logging
import atexit  # Para garantir o fechamento do pool de conexões ao sair

app = Flask(__name__)

ENVIRONMENT = "development"  # Alterar para "production" em produção

# Configuração do logger com base no ambiente
logging.basicConfig(
    level=logging.INFO if ENVIRONMENT == "development" else logging.WARNING,
    format="%(asctime)s %(levelname)s: %(message)s"
)
logger = logging.getLogger()

# Configuração de CORS
CORS(app, resources={r"/*": {"origins": "*"}})

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
        logger.debug(f"Dados recebidos: {data}")

# Configuração do after_request
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    return response

# Registrar os blueprints para rotas modularizadas
app.register_blueprint(main_routes)
app.register_blueprint(locacoes_routes)
app.register_blueprint(clientes_routes)
app.register_blueprint(inventario_routes)
app.register_blueprint(reports_bp, url_prefix='/reports')  # Registrando o blueprint de relatórios com um prefixo

# Middleware para tratar erros de requisição
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Erro durante a requisição: {e}")
    return jsonify({"error": "Erro interno no servidor, tente novamente mais tarde."}), 500

# Função para fechar o pool de conexões ao encerrar a aplicação
def fechar_conexoes():
    close_all_connections()
    logger.info("Pool de conexões fechado com sucesso ao encerrar a aplicação.")

# Configura o fechamento do pool de conexões quando a aplicação for encerrada
atexit.register(fechar_conexoes)

# Função principal para rodar a aplicação
if __name__ == "__main__":
    inicializar_banco()
    try:
        logger.info("Iniciando a aplicação Flask...")
        app.run(debug=(ENVIRONMENT == "development"), host="0.0.0.0", port=5000)
    except Exception as e:
        logger.error(f"Erro ao iniciar a aplicação: {e}")
