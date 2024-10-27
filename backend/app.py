from flask import Flask, request, jsonify
from flask_cors import CORS  # Adicionar suporte a CORS
from routes import routes  # Certifique-se de que o módulo routes está corretamente configurado
from database import create_tables  # Importar a função para criar tabelas
import logging

app = Flask(__name__)

# Ativar o CORS para permitir que o frontend se comunique com o backend
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuração do logger apenas para o console
logger = logging.getLogger()
logger.setLevel(logging.WARNING)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.WARNING)
formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# Função para criar/verificar as tabelas no banco de dados ao iniciar a aplicação
def inicializar_banco():
    try:
        create_tables()
        logging.info("Tabelas verificadas/criadas com sucesso!")
        print("Tabelas verificadas/criadas com sucesso!")
    except Exception as e:
        logging.error(f"Erro ao criar/verificar tabelas: {e}")
        print(f"Erro ao criar/verificar tabelas: {e}")

# Middleware para registrar cada requisição recebida
@app.before_request
def log_request_info():
    logging.info(f"Requisição recebida: {request.method} {request.url}")
    # Logar dados da requisição apenas para métodos que possam alterar dados e ignorar o Content-Type no DELETE
    if request.method in ["POST", "PUT", "DELETE"]:
        try:
            data = request.get_json(silent=True)  # Usa silent=True para evitar erros quando o body está vazio
            logging.info(f"Dados recebidos: {data}")
        except Exception as e:
            logging.warning(f"Falha ao logar dados da requisição: {e}")

# Configurar o after_request para assegurar que métodos e cabeçalhos apropriados sejam permitidos nas requisições CORS
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    return response

# Registrar as rotas do blueprint
app.register_blueprint(routes)

# Middleware para tratar erros de requisição de forma padronizada e logar erros
@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"Erro durante a requisição: {e}")
    return jsonify({"error": "Erro interno no servidor, tente novamente mais tarde."}), 500

# Função principal para rodar a aplicação
if __name__ == '__main__':
    inicializar_banco()
    try:
        logging.info("Iniciando a aplicação Flask...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logging.error(f"Erro ao iniciar a aplicação: {e}")
        print(f"Erro ao iniciar a aplicação: {e}")
