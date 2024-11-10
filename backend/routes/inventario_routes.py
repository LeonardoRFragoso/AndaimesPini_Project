from flask import Blueprint, request, jsonify
from models.inventario import Inventario  # Import específico para modularidade
from helpers import handle_database_error
import logging
from psycopg2 import Error as DatabaseError  # Nome mais claro para erro de banco de dados

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de inventário
inventario_routes = Blueprint('inventario_routes', __name__)

@inventario_routes.route('/', methods=['GET'])
def get_inventario():
    """
    Rota para listar todos os itens do inventário com quantidades atualizadas.
    """
    try:
        inventario = Inventario.get_all()
        logger.info("Itens do inventário listados com sucesso.")
        return jsonify(inventario), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar inventário: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar inventário."}), 500

@inventario_routes.route('/', methods=['POST'])
def add_inventario():
    """
    Rota para adicionar um novo item ao inventário.
    """
    try:
        novo_item = request.get_json()
        nome_item = novo_item.get('nome_item')
        quantidade = novo_item.get('quantidade')
        tipo_item = novo_item.get('tipo_item')

        if not nome_item or quantidade is None or not tipo_item:
            return jsonify({"error": "Nome do item, quantidade e tipo são obrigatórios!"}), 400

        item_existente = Inventario.get_item_id_by_modelo(nome_item)
        if item_existente:
            return jsonify({"error": f"Item '{nome_item}' já existe no inventário!"}), 400

        Inventario.create(nome_item, quantidade, tipo_item)
        logger.info(f"Item '{nome_item}' adicionado ao inventário com sucesso.")
        
        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        return jsonify({"message": "Item adicionado ao inventário com sucesso!", "inventario": inventario}), 201
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao adicionar item ao inventário: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar item ao inventário."}), 500

@inventario_routes.route('/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """
    Rota para atualizar a quantidade de um item no inventário.
    """
    try:
        dados = request.get_json()
        nova_quantidade = dados.get('quantidade')

        if nova_quantidade is None:
            return jsonify({"error": "Quantidade é obrigatória!"}), 400

        sucesso = Inventario.update_quantidade(item_id, nova_quantidade)
        if not sucesso:
            return jsonify({"error": "Erro ao atualizar quantidade do item."}), 500

        logger.info(f"Quantidade do item ID {item_id} atualizada para {nova_quantidade}.")
        
        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        return jsonify({"message": "Quantidade do item atualizada com sucesso!", "inventario": inventario}), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar item: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar item."}), 500

@inventario_routes.route('/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """
    Rota para excluir um item do inventário.
    """
    try:
        sucesso = Inventario.delete_item(item_id)
        if not sucesso:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        logger.info(f"Item ID {item_id} excluído com sucesso.")
        
        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        return jsonify({"message": "Item excluído com sucesso!", "inventario": inventario}), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao excluir item: {ex}")
        return jsonify({"error": "Erro inesperado ao excluir item."}), 500

@inventario_routes.route('/disponiveis', methods=['GET'])
def get_inventario_disponiveis():
    """
    Rota para listar todos os itens disponíveis no inventário com quantidade atualizada.
    """
    try:
        inventario_disponivel = Inventario.get_available()  # Retorna `quantidade_disponivel`
        logger.info("Itens disponíveis no inventário listados com sucesso.")
        return jsonify(inventario_disponivel), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar inventário disponível: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar inventário disponível."}), 500

@inventario_routes.route('/<int:item_id>/atualizar-estoque', methods=['PUT'])
def retirar_estoque(item_id):
    """
    Rota para subtrair uma quantidade específica de um item do estoque.
    """
    try:
        dados = request.get_json()
        quantidade_retirada = dados.get('quantidade')

        if quantidade_retirada is None or quantidade_retirada <= 0:
            return jsonify({"error": "Quantidade de retirada é obrigatória e deve ser positiva!"}), 400

        # Verifique a quantidade disponível antes de atualizar
        item = Inventario.get_item_by_id(item_id)
        if item is None:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        if item['quantidade_disponivel'] < quantidade_retirada:
            return jsonify({"error": "Quantidade insuficiente para a retirada."}), 400

        logger.info(f"Tentando retirar do estoque: Item ID {item_id}, Quantidade: {quantidade_retirada}")
        sucesso = Inventario.atualizar_estoque(item_id, quantidade_retirada)
        if sucesso:
            logger.info(f"Quantidade retirada do estoque para item ID {item_id}: {quantidade_retirada}")
        else:
            logger.error(f"Falha ao atualizar o estoque para o item ID {item_id}.")
            return jsonify({"error": "Erro ao atualizar o estoque."}), 500
        
        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        return jsonify({"message": "Quantidade retirada do estoque com sucesso!", "inventario": inventario}), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao retirar do estoque: {ex}")
        return jsonify({"error": "Erro inesperado ao retirar do estoque."}), 500

@inventario_routes.route('/<int:item_id>/restaurar-estoque', methods=['PUT'])
def restaurar_estoque_route(item_id):
    """
    Rota para restaurar uma quantidade específica de um item no estoque.
    """
    try:
        dados = request.get_json()
        quantidade = dados.get('quantidade')

        if quantidade is None or quantidade <= 0:
            return jsonify({"error": "Quantidade para restauração é obrigatória e deve ser positiva!"}), 400

        item = Inventario.get_item_by_id(item_id)
        if item is None:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        sucesso = Inventario.restaurar_estoque(item_id, quantidade)
        if sucesso:
            logger.info(f"Quantidade restaurada ao estoque para item ID {item_id}: {quantidade}")
        else:
            logger.error(f"Falha ao restaurar o estoque para o item ID {item_id}.")
            return jsonify({"error": "Erro ao restaurar o estoque."}), 500
        
        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        return jsonify({"message": "Quantidade restaurada ao estoque com sucesso!", "inventario": inventario}), 200
    except DatabaseError as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao restaurar o estoque: {ex}")
        return jsonify({"error": "Erro inesperado ao restaurar o estoque."}), 500
