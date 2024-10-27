from flask import Blueprint, request, jsonify
from models.cliente import Cliente  # Import específico para modularidade
from psycopg2 import Error as DatabaseError  # Nome mais claro para erro de banco de dados
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)

# Criação do blueprint para as rotas de clientes
clientes_routes = Blueprint('clientes_routes', __name__)

@clientes_routes.route('/clientes', methods=['GET'])
def get_clientes():
    """
    Rota para listar todos os clientes.
    """
    try:
        clientes = Cliente.get_all()
        logging.info(f"Clientes encontrados: {clientes}")
        return jsonify(clientes), 200
    except DatabaseError as e:
        logging.error(f"Erro ao buscar clientes no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar clientes."}), 500
    except Exception as ex:
        logging.error(f"Erro inesperado ao buscar clientes: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar clientes."}), 500

@clientes_routes.route('/clientes', methods=['POST'])
def add_cliente():
    """
    Rota para adicionar um novo cliente.
    """
    try:
        novo_cliente = request.get_json()
        nome = novo_cliente.get('nome')
        endereco = novo_cliente.get('endereco')
        telefone = novo_cliente.get('telefone')
        referencia = novo_cliente.get('referencia')

        if not nome or not telefone:
            return jsonify({"error": "Nome e telefone são campos obrigatórios!"}), 400

        cliente_id = Cliente.create(nome, endereco, telefone, referencia)
        if cliente_id is None:
            logging.error("Erro ao adicionar o cliente.")
            return jsonify({"error": "Erro ao adicionar o cliente!"}), 500

        logging.info(f"Cliente adicionado com sucesso: ID {cliente_id}")
        return jsonify({"message": "Cliente adicionado com sucesso!", "cliente_id": cliente_id}), 201
    except DatabaseError as e:
        logging.error(f"Erro ao adicionar cliente: {e}")
        return jsonify({"error": "Erro ao adicionar cliente."}), 500
    except Exception as ex:
        logging.error(f"Erro inesperado ao adicionar cliente: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar cliente."}), 500

@clientes_routes.route('/clientes/<int:cliente_id>', methods=['PUT'])
def update_cliente(cliente_id):
    """
    Rota para atualizar as informações de um cliente existente.
    """
    try:
        dados = request.get_json()
        nome = dados.get('nome')
        endereco = dados.get('endereco')
        telefone = dados.get('telefone')
        referencia = dados.get('referencia')

        if not nome or not telefone:
            return jsonify({"error": "Nome e telefone são campos obrigatórios!"}), 400

        atualizado = Cliente.update(cliente_id, nome, endereco, telefone, referencia)
        if not atualizado:
            logging.warning(f"Cliente com ID {cliente_id} não encontrado ou erro ao atualizar.")
            return jsonify({"error": "Cliente não encontrado ou erro ao atualizar!"}), 404

        logging.info(f"Cliente atualizado com sucesso: ID {cliente_id}")
        return jsonify({"message": "Cliente atualizado com sucesso!"}), 200
    except DatabaseError as e:
        logging.error(f"Erro ao atualizar cliente: {e}")
        return jsonify({"error": "Erro ao atualizar cliente."}), 500
    except Exception as ex:
        logging.error(f"Erro inesperado ao atualizar cliente: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar cliente."}), 500

@clientes_routes.route('/clientes/<int:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    """
    Rota para excluir um cliente existente.
    """
    try:
        excluido = Cliente.delete(cliente_id)
        if not excluido:
            logging.warning(f"Cliente com ID {cliente_id} não encontrado ou erro ao excluir.")
            return jsonify({"error": "Cliente não encontrado ou erro ao excluir!"}), 404

        logging.info(f"Cliente excluído com sucesso: ID {cliente_id}")
        return jsonify({"message": "Cliente excluído com sucesso!"}), 200
    except DatabaseError as e:
        logging.error(f"Erro ao excluir cliente: {e}")
        return jsonify({"error": "Erro ao excluir cliente."}), 500
    except Exception as ex:
        logging.error(f"Erro inesperado ao excluir cliente: {ex}")
        return jsonify({"error": "Erro inesperado ao excluir cliente."}), 500
