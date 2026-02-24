from flask import Blueprint, request, jsonify
from models.itens_locados import ItensLocados
from helpers import handle_database_error
import sqlite3
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de itens locados
itens_locados_routes = Blueprint('itens_locados_routes', __name__, url_prefix='/itens-locados')

@itens_locados_routes.route('/locacao/<int:locacao_id>', methods=['GET'])
def obter_itens_por_locacao(locacao_id):
    """Rota para obter todos os itens de uma locação específica."""
    try:
        itens = ItensLocados.obter_por_locacao(locacao_id)
        if not itens:
            logger.info(f"Nenhum item encontrado para a locação ID {locacao_id}.")
            return jsonify([]), 200
        
        logger.info(f"{len(itens)} itens encontrados para a locação ID {locacao_id}.")
        return jsonify(itens), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao buscar itens da locação."}), 500

@itens_locados_routes.route('/adicionar', methods=['POST'])
def adicionar_item():
    """Rota para adicionar um item a uma locação."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['locacao_id', 'item_id', 'quantidade']
        for campo in campos_obrigatorios:
            if campo not in dados:
                logger.warning(f"Campo obrigatório ausente: {campo}")
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400
        
        sucesso = ItensLocados.adicionar_item(
            locacao_id=dados['locacao_id'],
            item_id=dados['item_id'],
            quantidade=dados['quantidade']
        )
        
        if sucesso:
            logger.info(f"Item ID {dados['item_id']} adicionado à locação ID {dados['locacao_id']}.")
            return jsonify({"message": "Item adicionado com sucesso!"}), 201
        else:
            logger.error("Erro ao adicionar item à locação.")
            return jsonify({"error": "Erro ao adicionar item à locação."}), 500
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao adicionar item à locação."}), 500

@itens_locados_routes.route('/devolver', methods=['POST'])
def devolver_item():
    """Rota para marcar um item como devolvido."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        if 'locacao_id' not in dados:
            logger.warning("Campo 'locacao_id' não fornecido.")
            return jsonify({"error": "O campo 'locacao_id' é obrigatório."}), 400
        
        locacao_id = dados['locacao_id']
        item_id = dados.get('item_id')  # Opcional, se None, todos os itens serão marcados
        data_devolucao = dados.get('data_devolucao')  # Opcional, se None, usa a data atual
        
        sucesso = ItensLocados.marcar_como_devolvido(locacao_id, item_id, data_devolucao)
        
        if sucesso:
            msg = f"Item(s) marcado(s) como devolvido(s) para locação ID {locacao_id}."
            logger.info(msg)
            return jsonify({"message": msg}), 200
        else:
            logger.warning(f"Erro ao marcar item(s) como devolvido(s) para locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao marcar item(s) como devolvido(s)."}), 400
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao marcar item(s) como devolvido(s)."}), 500

@itens_locados_routes.route('/problema', methods=['POST'])
def registrar_problema():
    """Rota para registrar um problema com um item locado."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['locacao_id', 'item_id', 'descricao_problema']
        for campo in campos_obrigatorios:
            if campo not in dados:
                logger.warning(f"Campo obrigatório ausente: {campo}")
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400
        
        sucesso = ItensLocados.registrar_problema(
            locacao_id=dados['locacao_id'],
            item_id=dados['item_id'],
            descricao_problema=dados['descricao_problema']
        )
        
        if sucesso:
            logger.info(f"Problema registrado para item ID {dados['item_id']} na locação ID {dados['locacao_id']}.")
            return jsonify({"message": "Problema registrado com sucesso!"}), 201
        else:
            logger.error("Erro ao registrar problema.")
            return jsonify({"error": "Erro ao registrar problema."}), 500
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao registrar problema."}), 500
