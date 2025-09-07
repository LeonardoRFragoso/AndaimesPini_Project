from flask import Blueprint, request, jsonify
from models.inventario import Inventario  # Import específico para modularidade
from helpers import handle_database_error
import logging
import sqlite3

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de inventário
inventario_routes = Blueprint('inventario_routes', __name__, url_prefix='/inventario')

@inventario_routes.route('', methods=['GET'])
def get_inventario():
    """
    Rota para listar todos os itens do inventário com quantidades atualizadas.
    Suporta parâmetro ?disponivel=true para filtrar apenas itens disponíveis.
    """
    try:
        # Verificar se o parâmetro disponivel=true foi passado
        only_available = request.args.get('disponivel') == 'true'
        
        inventario = Inventario.get_all(only_available=only_available)
        if not inventario:
            if only_available:
                logger.info("Nenhum item disponível no inventário.")
                return jsonify({"message": "Nenhum item disponível no inventário."}), 200
            else:
                logger.info("Nenhum item encontrado no inventário.")
                return jsonify({"message": "Nenhum item encontrado no inventário."}), 200
                
        if only_available:
            logger.info(f"Total de itens disponíveis: {len(inventario)}")
        else:
            logger.info("Itens do inventário listados com sucesso.")
            
        return jsonify(inventario), 200
    except sqlite3.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar inventário: {ex}", exc_info=True)
        return jsonify({"error": "Erro inesperado ao buscar inventário."}), 500

@inventario_routes.route('', methods=['POST'])
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
        
        inventario = Inventario.get_all()
        return jsonify({"message": "Item adicionado ao inventário com sucesso!", "inventario": inventario}), 201
    except sqlite3.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao adicionar item ao inventário: {ex}", exc_info=True)
        return jsonify({"error": "Erro inesperado ao adicionar item ao inventário."}), 500

@inventario_routes.route('/disponiveis', methods=['GET'])
def get_inventario_disponiveis():
    """
    Rota para listar itens disponíveis no inventário.
    """
    try:
        itens_disponiveis = Inventario.get_all(only_available=True)
        if not itens_disponiveis:
            logger.info("Nenhum item disponível no inventário.")
            return jsonify({"message": "Nenhum item disponível no inventário."}), 200
        logger.info(f"Total de itens disponíveis: {len(itens_disponiveis)}")
        return jsonify(itens_disponiveis), 200
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar itens disponíveis no inventário: {ex}", exc_info=True)
        return jsonify({"error": "Erro ao buscar itens disponíveis no inventário."}), 500

@inventario_routes.route('/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """
    Rota para atualizar a quantidade total de um item no inventário.
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
        
        inventario = Inventario.get_all()
        return jsonify({"message": "Quantidade do item atualizada com sucesso!", "inventario": inventario}), 200
    except sqlite3.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar item: {ex}", exc_info=True)
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
        
        inventario = Inventario.get_all()
        return jsonify({"message": "Item excluído com sucesso!", "inventario": inventario}), 200
    except sqlite3.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao excluir item: {ex}", exc_info=True)
        return jsonify({"error": "Erro inesperado ao excluir item."}), 500

@inventario_routes.route('/<int:item_id>/atualizar-estoque', methods=['PUT'])
def atualizar_estoque(item_id):
    """
    Rota para atualizar o estoque de um item.
    """
    try:
        dados = request.get_json()
        quantidade_retirada = dados.get('quantidade')

        if quantidade_retirada is None or quantidade_retirada <= 0:
            return jsonify({"error": "Quantidade deve ser positiva!"}), 400

        item = Inventario.get_by_id(item_id)
        if item is None:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        if item['quantidade_disponivel'] < quantidade_retirada:
            return jsonify({"error": "Estoque insuficiente para retirada."}), 400

        sucesso = Inventario.update_stock(item_id, quantidade_retirada, operation="decrease")
        if not sucesso:
            return jsonify({"error": "Erro ao atualizar o estoque."}), 500

        inventario = Inventario.get_all()
        return jsonify({"message": "Estoque atualizado com sucesso!", "inventario": inventario}), 200
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar estoque: {ex}", exc_info=True)
        return jsonify({"error": "Erro inesperado ao atualizar estoque."}), 500
