from flask import Blueprint, request, jsonify
from models.cliente import Cliente
from helpers import handle_database_error
import sqlite3
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de clientes
clientes_routes = Blueprint('clientes_routes', __name__, url_prefix='/clientes')

@clientes_routes.route('', methods=['POST'])
def add_cliente():
    """Rota para adicionar um novo cliente."""
    try:
        dados_cliente = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['nome', 'telefone']
        for campo in campos_obrigatorios:
            if not dados_cliente.get(campo):
                logger.warning(f"Campo obrigatório ausente: {campo}")
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400

        # Adiciona o cliente ao banco de dados
        cliente_id = Cliente.criar_cliente(
            nome=dados_cliente['nome'],
            endereco=dados_cliente.get('endereco', ""),
            telefone=dados_cliente['telefone'],
            referencia=dados_cliente.get('referencia', "")
        )

        if cliente_id is None:
            logger.error("Erro ao criar cliente.")
            return jsonify({"error": "Erro ao criar cliente."}), 500

        logger.info(f"Cliente criado com sucesso: ID {cliente_id}")
        return jsonify({"message": "Cliente criado com sucesso!", "id": cliente_id}), 201

    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao criar cliente: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao criar cliente: {ex}")
        return jsonify({"error": "Erro ao criar cliente."}), 500


@clientes_routes.route('/<int:cliente_id>', methods=['GET'])
def get_cliente(cliente_id):
    """Rota para buscar informações de um cliente específico."""
    try:
        cliente = Cliente.obter_cliente_por_id(cliente_id)
        if not cliente:
            logger.warning(f"Cliente ID {cliente_id} não encontrado.")
            return jsonify({"error": "Cliente não encontrado."}), 404

        logger.info(f"Cliente encontrado: ID {cliente_id}")
        return jsonify(cliente), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao buscar cliente ID {cliente_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar cliente ID {cliente_id}: {ex}")
        return jsonify({"error": "Erro ao buscar cliente."}), 500


@clientes_routes.route('', methods=['GET'])
def get_todos_clientes():
    """Rota para listar todos os clientes."""
    try:
        clientes = Cliente.get_all()  # Corrigida a chamada do método
        if not clientes:
            logger.info("Nenhum cliente encontrado.")
            return jsonify({"message": "Nenhum cliente encontrado."}), 200

        logger.info(f"{len(clientes)} clientes encontrados.")
        return jsonify(clientes), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao buscar todos os clientes: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar todos os clientes: {ex}")
        return jsonify({"error": "Erro ao buscar todos os clientes."}), 500


@clientes_routes.route('/<int:cliente_id>', methods=['PUT'])
def update_cliente(cliente_id):
    """Rota para atualizar informações de um cliente."""
    try:
        dados_cliente = request.get_json()
        if not dados_cliente:
            logger.warning("Dados do cliente não fornecidos.")
            return jsonify({"error": "Nenhum dado fornecido para atualização."}), 400

        atualizado = Cliente.atualizar_cliente(
            cliente_id=cliente_id,
            nome=dados_cliente.get('nome'),
            endereco=dados_cliente.get('endereco'),
            telefone=dados_cliente.get('telefone'),
            referencia=dados_cliente.get('referencia')
        )

        if not atualizado:
            logger.warning(f"Cliente ID {cliente_id} não encontrado ou erro na atualização.")
            return jsonify({"error": "Erro ao atualizar cliente ou cliente não encontrado."}), 404

        logger.info(f"Cliente ID {cliente_id} atualizado com sucesso.")
        return jsonify({"message": "Cliente atualizado com sucesso!"}), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao atualizar cliente ID {cliente_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao atualizar cliente ID {cliente_id}: {ex}")
        return jsonify({"error": "Erro ao atualizar cliente."}), 500


@clientes_routes.route('/<int:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    """Rota para deletar um cliente."""
    try:
        deletado = Cliente.excluir_cliente(cliente_id)
        if not deletado:
            logger.warning(f"Cliente ID {cliente_id} não encontrado ou erro na exclusão.")
            return jsonify({"error": "Erro ao deletar cliente ou cliente não encontrado."}), 404

        logger.info(f"Cliente ID {cliente_id} deletado com sucesso.")
        return jsonify({"message": "Cliente deletado com sucesso!"}), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao deletar cliente ID {cliente_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao deletar cliente ID {cliente_id}: {ex}")
        return jsonify({"error": "Erro ao deletar cliente."}), 500
