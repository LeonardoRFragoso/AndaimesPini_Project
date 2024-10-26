from flask import Flask, request
from flask_cors import CORS  # Adicionar suporte a CORS
from routes import routes  # Certifique-se de que o módulo routes está corretamente configurado
from database import create_tables  # Importar a função para criar tabelas
import logging

app = Flask(__name__)

# Ativar o CORS para permitir que o frontend se comunique com o backend
CORS(app)

# Configurar o logging para registrar erros e informações em um arquivo 'app.log'
logging.basicConfig(filename='app.log', level=logging.DEBUG, format='%(asctime)s %(levelname)s: %(message)s')

# Função para criar/verificar as tabelas no banco de dados ao iniciar a aplicação
def inicializar_banco():
    try:
        create_tables()
        logging.info("Tabelas verificadas/criadas com sucesso!")
        print("Tabelas verificadas/criadas com sucesso!")
    except Exception as e:
        # Registrar qualquer erro que ocorra durante a criação das tabelas
        logging.error(f"Erro ao criar/verificar tabelas: {e}")
        print(f"Erro ao criar/verificar tabelas: {e}")

# Middleware para registrar cada requisição recebida
@app.before_request
def log_request_info():
    logging.info(f"Requisição recebida: {request.method} {request.url}")
    if request.method == "POST":
        logging.info(f"Dados recebidos: {request.get_json()}")

# Registrar as rotas do blueprint
app.register_blueprint(routes)

# Função principal para rodar a aplicação
if __name__ == '__main__':
    # Inicializar o banco de dados
    inicializar_banco()
    
    # Verificar se a aplicação está no ambiente correto para debug e qual endereço será utilizado
    # Debug deve estar ativado apenas em desenvolvimento
    try:
        logging.info("Iniciando a aplicação Flask...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        # Registrar o erro de inicialização da aplicação
        logging.error(f"Erro ao iniciar a aplicação: {e}")
        print(f"Erro ao iniciar a aplicação: {e}")
