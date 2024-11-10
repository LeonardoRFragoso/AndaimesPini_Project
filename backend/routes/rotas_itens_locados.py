from flask import Blueprint, jsonify, request
from models.itens_locados import ItensLocados
from helpers import handle_database_error
import psycopg2
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de itens locados
itens_locados_routes = Blueprint('itens_locados_routes', __name__, url_prefix='/itens-locados')


@itens_locados_routes.route('/<int:locacao_id>', methods=['GET'])
def get_itens_por_locacao(locacao_id):
    """
    Rota para obter itens de uma locação específica.
    
    :param locacao_id: ID da locação cujos itens serão buscados.
    :return: JSON contendo os itens da locação ou uma mensagem de erro.
    """
    try:
        # Busca os itens associados à locação pelo ID
        itens = ItensLocados.get_by_locacao(locacao_id)
        
        if not itens:
            logger.warning(f"Nenhum item encontrado para a locação ID {locacao_id}")
            return jsonify({"error": "Nenhum item encontrado para esta locação."}), 404

        logger.info(f"Itens encontrados para a locação ID {locacao_id}: {itens}")
        return jsonify(itens), 200

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao buscar itens da locação ID {locacao_id}: {e}")
        return handle_database_error(e)

    except Exception as ex:
        logger.error(f"Erro ao buscar itens da locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao buscar itens da locação."}), 500


@itens_locados_routes.route('', methods=['GET'])
def get_todos_itens_locados():
    """
    Rota para listar todos os itens locados de todas as locações.
    
    :return: JSON contendo todos os itens locados ou uma mensagem de erro.
    """
    try:
        # Busca todos os itens locados
        itens = ItensLocados.get_all()
        
        if not itens:
            logger.warning("Nenhum item locado encontrado.")
            return jsonify({"message": "Nenhum item locado encontrado."}), 200

        logger.info(f"{len(itens)} itens locados encontrados.")
        return jsonify(itens), 200

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao buscar todos os itens locados: {e}")
        return handle_database_error(e)

    except Exception as ex:
        logger.error(f"Erro ao buscar todos os itens locados: {ex}")
        return jsonify({"error": "Erro ao buscar todos os itens locados."}), 500


@itens_locados_routes.route('/adicionar', methods=['POST'])
def adicionar_item_locado():
    """
    Rota para adicionar um novo item locado a uma locação.
    
    :return: JSON com o ID do item locado criado ou uma mensagem de erro.
    """
    try:
        dados = request.json
        locacao_id = dados.get("locacao_id")
        item_id = dados.get("item_id")
        quantidade = dados.get("quantidade")

        if not (locacao_id and item_id and quantidade):
            logger.warning("Parâmetros insuficientes para adicionar item locado.")
            return jsonify({"error": "Parâmetros insuficientes para adicionar item locado."}), 400

        item_locado_id = ItensLocados.adicionar_item(locacao_id, item_id, quantidade)
        if not item_locado_id:
            logger.error("Erro ao adicionar item locado.")
            return jsonify({"error": "Erro ao adicionar item locado."}), 500

        logger.info(f"Item locado adicionado com sucesso. ID: {item_locado_id}")
        return jsonify({"message": "Item locado adicionado com sucesso.", "item_locado_id": item_locado_id}), 201

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao adicionar item locado: {e}")
        return handle_database_error(e)

    except Exception as ex:
        logger.error(f"Erro inesperado ao adicionar item locado: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar item locado."}), 500


@itens_locados_routes.route('/<int:locacao_id>/<int:item_id>', methods=['DELETE'])
def remover_item_locado(locacao_id, item_id):
    """
    Rota para remover um item locado específico de uma locação.
    
    :param locacao_id: ID da locação.
    :param item_id: ID do item a ser removido.
    :return: JSON com mensagem de sucesso ou erro.
    """
    try:
        item_removido = ItensLocados.remover_item(locacao_id, item_id)
        if not item_removido:
            logger.warning(f"Item ID {item_id} não encontrado na locação ID {locacao_id}.")
            return jsonify({"error": "Item não encontrado na locação."}), 404

        logger.info(f"Item ID {item_id} removido da locação ID {locacao_id}.")
        return jsonify({"message": "Item locado removido com sucesso."}), 200

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao remover item ID {item_id} da locação ID {locacao_id}: {e}")
        return handle_database_error(e)

    except Exception as ex:
        logger.error(f"Erro ao remover item ID {item_id} da locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao remover item locado."}), 500
