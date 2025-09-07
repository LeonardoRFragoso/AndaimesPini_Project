from flask import Blueprint, jsonify, request
from models.notificacao import Notificacao
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do Blueprint para notificações
notificacoes_routes = Blueprint('notificacoes_routes', __name__)

@notificacoes_routes.route('/', methods=['GET'])
def obter_todas_notificacoes():
    """
    Retorna todas as notificações.
    """
    try:
        # Gerar notificações automáticas antes de retornar
        Notificacao.gerar_notificacoes_automaticas()
        
        notificacoes = Notificacao.get_all()
        return jsonify({
            "status": "success",
            "data": notificacoes,
            "message": f"Encontradas {len(notificacoes)} notificações."
        }), 200
    except Exception as e:
        logger.error(f"Erro ao obter notificações: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao obter notificações: {str(e)}"
        }), 500

@notificacoes_routes.route('/nao-lidas', methods=['GET'])
def obter_notificacoes_nao_lidas():
    """
    Retorna todas as notificações não lidas.
    """
    try:
        # Gerar notificações automáticas antes de retornar
        Notificacao.gerar_notificacoes_automaticas()
        
        notificacoes = Notificacao.get_unread()
        return jsonify({
            "status": "success",
            "data": notificacoes,
            "message": f"Encontradas {len(notificacoes)} notificações não lidas."
        }), 200
    except Exception as e:
        logger.error(f"Erro ao obter notificações não lidas: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao obter notificações não lidas: {str(e)}"
        }), 500

@notificacoes_routes.route('/<int:notificacao_id>/marcar-lida', methods=['PUT'])
def marcar_notificacao_como_lida(notificacao_id):
    """
    Marca uma notificação específica como lida.
    """
    try:
        sucesso = Notificacao.marcar_como_lida(notificacao_id)
        if sucesso:
            return jsonify({
                "status": "success",
                "message": f"Notificação {notificacao_id} marcada como lida."
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": f"Notificação {notificacao_id} não encontrada."
            }), 404
    except Exception as e:
        logger.error(f"Erro ao marcar notificação como lida: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao marcar notificação como lida: {str(e)}"
        }), 500

@notificacoes_routes.route('/marcar-todas-lidas', methods=['PUT'])
def marcar_todas_notificacoes_como_lidas():
    """
    Marca todas as notificações como lidas.
    """
    try:
        sucesso = Notificacao.marcar_todas_como_lidas()
        return jsonify({
            "status": "success",
            "message": "Todas as notificações foram marcadas como lidas."
        }), 200
    except Exception as e:
        logger.error(f"Erro ao marcar todas notificações como lidas: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao marcar todas notificações como lidas: {str(e)}"
        }), 500

@notificacoes_routes.route('/<int:notificacao_id>', methods=['DELETE'])
def excluir_notificacao(notificacao_id):
    """
    Exclui uma notificação específica.
    """
    try:
        sucesso = Notificacao.excluir_notificacao(notificacao_id)
        if sucesso:
            return jsonify({
                "status": "success",
                "message": f"Notificação {notificacao_id} excluída com sucesso."
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": f"Notificação {notificacao_id} não encontrada."
            }), 404
    except Exception as e:
        logger.error(f"Erro ao excluir notificação: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao excluir notificação: {str(e)}"
        }), 500

@notificacoes_routes.route('/', methods=['POST'])
def criar_notificacao():
    """
    Cria uma nova notificação.
    """
    try:
        dados = request.get_json()
        
        if not dados or not all(k in dados for k in ['tipo', 'titulo', 'mensagem']):
            return jsonify({
                "status": "error",
                "message": "Dados incompletos. Tipo, título e mensagem são obrigatórios."
            }), 400
        
        tipo = dados.get('tipo')
        titulo = dados.get('titulo')
        mensagem = dados.get('mensagem')
        relacionado_id = dados.get('relacionado_id')
        
        notificacao_id = Notificacao.criar_notificacao(tipo, titulo, mensagem, relacionado_id)
        
        if notificacao_id:
            return jsonify({
                "status": "success",
                "data": {"id": notificacao_id},
                "message": "Notificação criada com sucesso."
            }), 201
        else:
            return jsonify({
                "status": "error",
                "message": "Erro ao criar notificação."
            }), 500
    except Exception as e:
        logger.error(f"Erro ao criar notificação: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao criar notificação: {str(e)}"
        }), 500

@notificacoes_routes.route('/gerar-automaticas', methods=['POST'])
def gerar_notificacoes_automaticas():
    """
    Gera notificações automáticas com base em condições do sistema.
    """
    try:
        quantidade = Notificacao.gerar_notificacoes_automaticas()
        return jsonify({
            "status": "success",
            "data": {"quantidade": quantidade},
            "message": f"Geradas {quantidade} notificações automáticas."
        }), 200
    except Exception as e:
        logger.error(f"Erro ao gerar notificações automáticas: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erro ao gerar notificações automáticas: {str(e)}"
        }), 500
