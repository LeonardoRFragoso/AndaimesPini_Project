from flask import Blueprint, request, jsonify
from models import Inventario
from helpers import atualizar_estoque, restaurar_estoque, handle_database_error
import psycopg2

# Criação do blueprint para as rotas de inventário
inventario_routes = Blueprint('inventario_routes', __name__)

@inventario_routes.route('/', methods=['GET'])
def get_inventario():
    """
    Rota para listar todos os itens do inventário.
    """
    try:
        inventario = Inventario.get_all()
        return jsonify(inventario), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao buscar inventário: {ex}")
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
            return jsonify({"error": f"Item {nome_item} já existe no inventário!"}), 400

        Inventario.create(nome_item, quantidade, tipo_item)
        return jsonify({"message": "Item adicionado ao inventário com sucesso!"}), 201
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao adicionar item ao inventário: {ex}")
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

        Inventario.update_quantidade(item_id, nova_quantidade)
        return jsonify({"message": "Quantidade do item atualizada com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao atualizar item: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar item."}), 500

@inventario_routes.route('/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    """
    Rota para excluir um item do inventário.
    """
    try:
        item = Inventario.get_by_id(item_id)
        if not item:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        Inventario.delete_item(item_id)
        return jsonify({"message": "Item excluído com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao excluir item: {ex}")
        return jsonify({"error": "Erro inesperado ao excluir item."}), 500

@inventario_routes.route('/disponiveis', methods=['GET'])
def get_inventario_disponiveis():
    """
    Rota para listar todos os itens disponíveis no inventário.
    """
    try:
        inventario_disponivel = Inventario.get_available()
        return jsonify(inventario_disponivel), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao buscar inventário disponível: {ex}")
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

        atualizar_estoque(item_id, quantidade_retirada)
        return jsonify({"message": "Quantidade retirada do estoque com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao retirar do estoque: {ex}")
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

        restaurar_estoque(item_id, quantidade)
        return jsonify({"message": "Quantidade restaurada ao estoque com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        print(f"Erro inesperado ao restaurar o estoque: {ex}")
        return jsonify({"error": "Erro inesperado ao restaurar o estoque."}), 500
