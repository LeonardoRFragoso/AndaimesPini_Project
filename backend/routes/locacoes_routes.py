from flask import Blueprint, request, jsonify
from models.locacao import Locacao
from helpers import handle_database_error
import sqlite3
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de locações
locacoes_routes = Blueprint('locacoes_routes', __name__, url_prefix='/locacoes')

@locacoes_routes.route('', methods=['POST'])
def criar_locacao():
    """Rota para criar uma nova locação."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['nome_cliente', 'telefone_cliente', 'data_inicio', 'data_fim', 'valor_total']
        for campo in campos_obrigatorios:
            if campo not in dados:
                logger.warning(f"Campo obrigatório ausente: {campo}")
                return jsonify({"error": f"O campo '{campo}' é obrigatório."}), 400
        
        # Criar a locação
        locacao_id = Locacao.criar_locacao(
            nome_cliente=dados['nome_cliente'],
            endereco_cliente=dados.get('endereco_cliente', ''),
            telefone_cliente=dados['telefone_cliente'],
            data_inicio=dados['data_inicio'],
            data_fim=dados['data_fim'],
            valor_total=dados['valor_total'],
            valor_pago_entrega=dados.get('valor_pago_entrega', 0),
            valor_receber_final=dados.get('valor_receber_final', 0),
            numero_nota=dados.get('numero_nota', ''),
            status=dados.get('status', 'ativo'),
            itens=dados.get('itens', [])
        )
        
        if locacao_id is None:
            logger.error("Erro ao criar locação.")
            return jsonify({"error": "Erro ao criar locação."}), 500
        
        logger.info(f"Locação criada com sucesso: ID {locacao_id}")
        return jsonify({"message": "Locação criada com sucesso!", "id": locacao_id}), 201
        
    except ValueError as ve:
        logger.error(f"Erro de validação: {ve}")
        return jsonify({"error": str(ve)}), 400
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao criar locação."}), 500

@locacoes_routes.route('', methods=['GET'])
def listar_locacoes():
    """Rota para listar todas as locações."""
    try:
        locacoes = Locacao.obter_todas_detalhadas()
        logger.info(f"{len(locacoes)} locações encontradas.")
        return jsonify(locacoes), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao listar locações."}), 500

@locacoes_routes.route('/<int:locacao_id>/confirmar-devolucao', methods=['POST'])
def confirmar_devolucao(locacao_id):
    """Rota para confirmar a devolução de uma locação."""
    try:
        resultado = Locacao.confirmar_devolucao(locacao_id)
        if resultado['sucesso']:
            logger.info(f"Devolução confirmada para locação ID {locacao_id}")
            return jsonify(resultado), 200
        else:
            logger.warning(f"Erro ao confirmar devolução: {resultado['mensagem']}")
            return jsonify(resultado), 400
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao confirmar devolução."}), 500

@locacoes_routes.route('/atrasadas', methods=['GET'])
def listar_locacoes_atrasadas():
    """Rota para listar todas as locações com devolução atrasada."""
    try:
        locacoes_atrasadas = Locacao.obter_locacoes_atrasadas()
        logger.info(f"{len(locacoes_atrasadas)} locações atrasadas encontradas.")
        return jsonify(locacoes_atrasadas), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao listar locações atrasadas."}), 500

@locacoes_routes.route('/<int:locacao_id>/status', methods=['PATCH'])
def atualizar_status(locacao_id):
    """Rota para atualizar o status de uma locação."""
    try:
        dados = request.get_json()
        if 'status' not in dados:
            logger.warning("Campo 'status' não fornecido.")
            return jsonify({"error": "O campo 'status' é obrigatório."}), 400
        
        novo_status = dados['status']
        sucesso = Locacao.atualizar_status(locacao_id, novo_status)
        
        if sucesso:
            logger.info(f"Status da locação ID {locacao_id} atualizado para '{novo_status}'.")
            return jsonify({"message": f"Status atualizado para '{novo_status}'."}), 200
        else:
            logger.warning(f"Locação ID {locacao_id} não encontrada ou erro na atualização.")
            return jsonify({"error": "Erro ao atualizar status ou locação não encontrada."}), 404
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado: {ex}")
        return jsonify({"error": "Erro ao atualizar status."}), 500
