from flask import Blueprint, request, jsonify
from models import RegistroDanos
import psycopg2

# Criação do blueprint para as rotas de danos
damages_routes = Blueprint('damages_routes', __name__)

@damages_routes.route('/danos', methods=['POST'])
def add_dano():
    """
    Rota para registrar um dano associado a uma locação.
    """
    try:
        dano_info = request.get_json()
        locacao_id = dano_info.get('locacao_id')
        item_id = dano_info.get('item_id')
        quantidade_danificada = dano_info.get('quantidade_danificada')

        if not locacao_id or not item_id or quantidade_danificada is None:
            return jsonify({"error": "Locação, item e quantidade danificada são obrigatórios!"}), 400

        RegistroDanos.add_dano(locacao_id, item_id, quantidade_danificada)
        return jsonify({"message": "Dano registrado com sucesso!"}), 201
    except psycopg2.Error as e:
        print(f"Erro ao registrar dano no banco de dados: {e}")
        return jsonify({"error": "Erro ao registrar dano."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao registrar dano: {ex}")
        return jsonify({"error": "Erro inesperado ao registrar dano."}), 500

@damages_routes.route('/danos/<int:locacao_id>', methods=['GET'])
def get_danos(locacao_id):
    """
    Rota para buscar danos associados a uma locação específica.
    """
    try:
        danos = RegistroDanos.get_by_locacao(locacao_id)
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar danos no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar danos."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar danos: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar danos."}), 500

@damages_routes.route('/danos', methods=['GET'])
def get_all_danos():
    """
    Rota para buscar todos os danos registrados.
    """
    try:
        danos = RegistroDanos.get_all()
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar todos os danos no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar todos os danos."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar todos os danos: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar todos os danos."}), 500

@damages_routes.route('/danos/<int:dano_id>', methods=['PUT'])
def update_dano(dano_id):
    """
    Rota para atualizar um registro de dano específico.
    """
    try:
        dados = request.get_json()
        locacao_id = dados.get('locacao_id')
        item_id = dados.get('item_id')
        quantidade_danificada = dados.get('quantidade_danificada')

        if not locacao_id or not item_id or quantidade_danificada is None:
            return jsonify({"error": "Locação, item e quantidade danificada são obrigatórios!"}), 400

        atualizado = RegistroDanos.update(dano_id, locacao_id, item_id, quantidade_danificada)
        if not atualizado:
            return jsonify({"error": "Dano não encontrado ou erro ao atualizar!"}), 404

        return jsonify({"message": "Dano atualizado com sucesso!"}), 200
    except psycopg2.Error as e:
        print(f"Erro ao atualizar dano: {e}")
        return jsonify({"error": "Erro ao atualizar dano."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao atualizar dano: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar dano."}), 500

@damages_routes.route('/danos/<int:dano_id>', methods=['DELETE'])
def delete_dano(dano_id):
    """
    Rota para excluir um registro de dano específico.
    """
    try:
        excluido = RegistroDanos.delete(dano_id)
        if not excluido:
            return jsonify({"error": "Dano não encontrado ou erro ao excluir!"}), 404

        return jsonify({"message": "Dano excluído com sucesso!"}), 200
    except psycopg2.Error as e:
        print(f"Erro ao excluir dano: {e}")
        return jsonify({"error": "Erro ao excluir dano."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao excluir dano: {ex}")
        return jsonify({"error": "Erro inesperado ao excluir dano."}), 500
