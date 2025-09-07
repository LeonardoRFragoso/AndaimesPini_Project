from flask import Blueprint, request, jsonify
from models.locacao import Locacao
from helpers import handle_database_error
from datetime import datetime
import psycopg2
import logging

# Definindo a lista de status válidos
STATUSES_VALIDOS = ["ativo", "concluido", "pendente", "concluído"]

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de locação
locacoes_routes = Blueprint('locacoes_routes', __name__, url_prefix='/locacoes')


@locacoes_routes.route('', methods=['GET'])
def get_locacoes():
    """
    Lista todas as locações com detalhes do cliente e itens locados.
    """
    try:
        locacoes = Locacao.obter_todas_detalhadas()
        if not locacoes:
            logger.info("Nenhuma locação encontrada.")
            return jsonify({"message": "Nenhuma locação encontrada."}), 200

        logger.info(f"{len(locacoes)} locações encontradas.")
        return jsonify(locacoes), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao buscar locações: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar locações: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar locações."}), 500


@locacoes_routes.route('/<int:locacao_id>', methods=['GET'])
def get_locacao_detalhes(locacao_id):
    """
    Obtém detalhes de uma locação específica.
    """
    try:
        locacao = Locacao.obter_detalhes_por_id(locacao_id)
        if not locacao:
            logger.warning(f"Locação ID {locacao_id} não encontrada.")
            return jsonify({"error": "Locação não encontrada"}), 404

        logger.info(f"Detalhes da locação ID {locacao_id} obtidos com sucesso.")
        return jsonify(locacao), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao buscar locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao obter detalhes da locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao buscar detalhes da locação."}), 500


@locacoes_routes.route('/<int:locacao_id>/confirmar-devolucao', methods=['PATCH'])
def confirmar_devolucao(locacao_id):
    """
    Confirma a devolução e atualiza o status da locação para 'concluido'.
    """
    try:
        locacao = Locacao.obter_detalhes_por_id(locacao_id)
        if not locacao:
            logger.warning(f"Locação ID {locacao_id} não encontrada.")
            return jsonify({"error": "Locação não encontrada"}), 404

        if locacao['status'] == 'concluido':
            logger.info(f"Locação ID {locacao_id} já concluída.")
            return jsonify({"message": "Locação já concluída."}), 200

        if locacao['status'] != 'ativo':
            logger.warning(f"Locação ID {locacao_id} não está ativa e não pode ser devolvida.")
            return jsonify({"error": "Somente locações ativas podem ser devolvidas."}), 400

        # Atualizar o status para "concluido"
        status_atualizado = Locacao.atualizar_status(locacao_id, "concluido")
        if not status_atualizado:
            logger.error(f"Erro ao atualizar status da locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao atualizar status da locação."}), 500

        # Atualizar estoque para devolução
        devolucao_confirmada = Locacao.atualizar_estoque_devolucao(locacao_id)
        if not devolucao_confirmada:
            logger.error(f"Erro ao atualizar estoque para locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao confirmar devolução e atualizar estoque."}), 500

        # Registrar a data de devolução
        data_devolucao = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sucesso_data = Locacao.registrar_data_devolucao(locacao_id, data_devolucao)
        if not sucesso_data:
            logger.error(f"Erro ao registrar data de devolução para locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao registrar data de devolução."}), 500

        logger.info(f"Devolução confirmada para locação ID {locacao_id}.")
        return jsonify({
            "message": "Devolução confirmada com sucesso.",
            "data_devolucao": data_devolucao
        }), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao confirmar devolução: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao confirmar devolução: {ex}")
        return jsonify({"error": "Erro ao confirmar devolução."}), 500


@locacoes_routes.route('/criar', methods=['POST'])
def criar_locacao():
    """
    Cria uma nova locação.
    """
    try:
        dados = request.get_json()
        if not dados:
            logger.error("Nenhum dado fornecido para criar locação.")
            return jsonify({"error": "Nenhum dado fornecido."}), 400

        # Log para verificar o payload recebido
        logger.debug(f"Dados recebidos para criação de locação: {dados}")

        # Verificar campos obrigatórios
        campos_obrigatorios = [
            "data_inicio", "data_fim", "valor_total", "itens",
            "nome_cliente", "endereco_cliente", "telefone_cliente", "numero_nota"
        ]
        for campo in campos_obrigatorios:
            if not dados.get(campo):
                logger.warning(f"Parâmetro obrigatório ausente: {campo}")
                return jsonify({"error": f"Parâmetro obrigatório ausente: {campo}"}), 400

        # Garantir valores padrão para campos opcionais
        dados["valor_pago_entrega"] = dados.get("valor_pago_entrega", 0)
        dados["valor_receber_final"] = dados.get("valor_receber_final", dados["valor_total"] - dados["valor_pago_entrega"])

        # Criar a locação
        locacao_id = Locacao.criar_locacao(
            nome_cliente=dados["nome_cliente"],
            endereco_cliente=dados["endereco_cliente"],
            telefone_cliente=dados["telefone_cliente"],
            data_inicio=dados["data_inicio"],
            data_fim=dados["data_fim"],
            valor_total=dados["valor_total"],
            valor_pago_entrega=dados["valor_pago_entrega"],
            valor_receber_final=dados["valor_receber_final"],
            numero_nota=dados["numero_nota"],
            status=dados.get("status", "ativo"),
            itens=dados["itens"]
        )

        if not locacao_id:
            logger.error("Erro ao criar locação.")
            return jsonify({"error": "Erro ao criar locação."}), 500

        logger.info(f"Locação criada com sucesso. ID: {locacao_id}")
        return jsonify({"message": "Locação criada com sucesso.", "locacao_id": locacao_id}), 201
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao criar locação: {e}")
        return handle_database_error(e)
    except ValueError as ve:
        logger.error(f"Erro de validação ao criar locação: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as ex:
        logger.error(f"Erro inesperado ao criar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao criar locação."}), 500


@locacoes_routes.route('/<int:locacao_id>/reativar', methods=['PATCH'])
def reativar_locacao(locacao_id):
    """
    Rota para reativar uma locação.
    """
    try:
        locacao = Locacao.obter_detalhes_por_id(locacao_id)
        if not locacao:
            logger.warning(f"Locação ID {locacao_id} não encontrada.")
            return jsonify({"error": "Locação não encontrada"}), 404

        if locacao["status"] == "ativo":
            logger.info(f"Locação ID {locacao_id} já está ativa.")
            return jsonify({"message": "A locação já está ativa."}), 200

        sucesso = Locacao.atualizar_status(locacao_id, "ativo")
        if not sucesso:
            logger.error(f"Erro ao reativar locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao reativar locação."}), 500

        logger.info(f"Locação ID {locacao_id} reativada com sucesso.")
        return jsonify({"message": "Locação reativada com sucesso."}), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao reativar locação: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao reativar locação: {ex}")
        return jsonify({"error": "Erro ao reativar locação."}), 500


@locacoes_routes.route('/<int:locacao_id>/status', methods=['PATCH'])
def atualizar_status_locacao(locacao_id):
    """
    Atualiza o status de uma locação específica.
    """
    try:
        dados = request.get_json()
        novo_status = dados.get("status")

        if not novo_status:
            logger.warning("Status não fornecido para atualização.")
            return jsonify({"error": "O status é obrigatório para atualizar a locação."}), 400

        # Validar o novo status
        if novo_status not in STATUSES_VALIDOS:
            logger.warning(f"Status inválido fornecido: {novo_status}")
            return jsonify({"error": f"Status inválido. Os status válidos são: {', '.join(STATUSES_VALIDOS)}."}), 400

        sucesso = Locacao.atualizar_status(locacao_id, novo_status)
        if not sucesso:
            logger.error(f"Erro ao atualizar status da locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao atualizar status da locação."}), 500

        logger.info(f"Status da locação ID {locacao_id} atualizado para '{novo_status}'.")
        return jsonify({"message": f"Status atualizado para '{novo_status}' com sucesso."}), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao atualizar status da locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar status da locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar status."}), 500


@locacoes_routes.route('/<int:locacao_id>', methods=['DELETE'])
def excluir_locacao(locacao_id):
    """
    Exclui uma locação do sistema.
    """
    try:
        # Verificar se a locação existe
        locacao = Locacao.obter_detalhes_por_id(locacao_id)
        if not locacao:
            logger.warning(f"Locação ID {locacao_id} não encontrada para exclusão.")
            return jsonify({"error": "Locação não encontrada"}), 404
        
        # Excluir a locação
        sucesso = Locacao.delete_locacao(locacao_id)
        if not sucesso:
            logger.error(f"Erro ao excluir locação ID {locacao_id}.")
            return jsonify({"error": "Erro ao excluir locação."}), 500
        
        logger.info(f"Locação ID {locacao_id} excluída com sucesso.")
        return jsonify({"message": "Locação excluída com sucesso."}), 200
        
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao excluir locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao excluir locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao excluir locação."}), 500
