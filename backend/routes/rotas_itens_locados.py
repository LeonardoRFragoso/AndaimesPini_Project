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
    """
    try:
        dados = request.get_json()
        
        # Validação dos dados enviados na requisição
        campos_obrigatorios = ["locacao_id", "item_id", "quantidade"]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                logger.warning(f"Parâmetro obrigatório ausente: {campo}")
                return jsonify({"error": f"Parâmetro obrigatório ausente: {campo}"}), 400

        locacao_id = dados["locacao_id"]
        item_id = dados["item_id"]
        quantidade = dados["quantidade"]

        # Validação de quantidade
        if quantidade <= 0:
            logger.warning("A quantidade deve ser maior que zero.")
            return jsonify({"error": "A quantidade deve ser maior que zero."}), 400

        # Adicionar o item locado
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
    """
    try:
        # Verifica se o item pode ser removido
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


@itens_locados_routes.route('/<int:locacao_id>/<int:item_id>', methods=['PUT'])
def atualizar_quantidade_item_locado(locacao_id, item_id):
    """
    Rota para atualizar a quantidade de um item locado específico.
    """
    try:
        dados = request.get_json()
        
        # Validação dos dados enviados na requisição
        if not dados or 'quantidade' not in dados:
            logger.warning("Quantidade não fornecida para atualização.")
            return jsonify({"error": "A quantidade é obrigatória para atualizar o item locado."}), 400
        
        nova_quantidade = dados["quantidade"]
        
        # Validação de quantidade
        if nova_quantidade <= 0:
            logger.warning("A quantidade deve ser maior que zero.")
            return jsonify({"error": "A quantidade deve ser maior que zero."}), 400
        
        # Atualizar a quantidade do item locado
        sucesso = ItensLocados.update_quantidade(locacao_id, item_id, nova_quantidade)
        if not sucesso:
            logger.error(f"Erro ao atualizar quantidade do item ID {item_id} na locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao atualizar quantidade do item locado."}), 500
        
        logger.info(f"Quantidade do item ID {item_id} na locação ID {locacao_id} atualizada para {nova_quantidade}.")
        return jsonify({"message": "Quantidade do item locado atualizada com sucesso."}), 200
        
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao atualizar quantidade do item ID {item_id} na locação ID {locacao_id}: {e}")
        return handle_database_error(e)
        
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar quantidade do item ID {item_id} na locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar quantidade do item locado."}), 500
