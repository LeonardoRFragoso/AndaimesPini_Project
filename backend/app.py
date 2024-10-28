from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import main_routes  # Importa o blueprint principal com todas as rotas
from routes.locacoes_routes import locacoes_routes  # Importa o blueprint de locacoes
from routes.clientes_routes import clientes_routes  # Importa o blueprint de clientes (se houver)
from routes.inventario_routes import inventario_routes  # Importa o blueprint de inventário (se houver)
from database import create_tables
import logging

app = Flask(__name__)

# Configuração de CORS
CORS(app)

# Configuração do logger
logging.basicConfig(level=logging.INFO,  # Altere para WARNING em produção
                    format='%(asctime)s %(levelname)s: %(message)s')
logger = logging.getLogger()

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
app.register_blueprint(main_routes)           # Rotas principais
app.register_blueprint(locacoes_routes)       # Rotas de locações
app.register_blueprint(clientes_routes)       # Rotas de clientes (se houver)
app.register_blueprint(inventario_routes)     # Rotas de inventário (se houver)

# Middleware para tratar erros de requisição
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Erro durante a requisição: {e}")
    return jsonify({"error": "Erro interno no servidor, tente novamente mais tarde."}), 500

# Função principal para rodar a aplicação
if __name__ == '__main__':
    inicializar_banco()
    try:
        logger.info("Iniciando a aplicação Flask...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logger.error(f"Erro ao iniciar a aplicação: {e}")
