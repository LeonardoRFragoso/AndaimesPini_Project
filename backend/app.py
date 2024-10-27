from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import main_routes  # Importa o blueprint principal com todas as rotas
from database import create_tables
import logging

app = Flask(__name__)

# Configuração de CORS
CORS(app)

# Configuração do logger
logging.basicConfig(level=logging.WARNING,  # Mude para WARNING para menos verbosidade
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

# Registrar as rotas do blueprint principal
app.register_blueprint(main_routes)  # Registra o blueprint com todas as rotas modularizadas

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
        app.run(debug=False, host='0.0.0.0', port=5000)  # Mude debug para False
    except Exception as e:
        logger.error(f"Erro ao iniciar a aplicação: {e}")
