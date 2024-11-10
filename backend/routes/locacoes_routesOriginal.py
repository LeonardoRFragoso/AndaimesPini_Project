from flask import Blueprint, request, jsonify
from models.cliente import Cliente
from models.inventario import Inventario
from models.locacao import Locacao
from models.itens_locados import ItensLocados
# Remover importações não utilizadas
from helpers import handle_database_error
import psycopg2
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de locação
locacoes_routes = Blueprint('locacoes_routes', __name__, url_prefix='/locacoes')

@locacoes_routes.route('', methods=['GET'])
@locacoes_routes.route('/', methods=['GET'])
def get_locacoes():
    """Rota para listar todas as locações com detalhes do cliente e itens locados."""
    try:
        locacoes = Locacao.get_all_detailed()
        logger.info(f"Locações encontradas: {len(locacoes)}")
        return jsonify(locacoes), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar locações: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar locações."}), 500

@locacoes_routes.route('/cliente/<int:cliente_id>', methods=['GET'])
def get_locacoes_por_cliente(cliente_id):
    """Rota para listar todas as locações de um cliente específico."""
    try:
        locacoes_cliente = Locacao.get_by_client_id(cliente_id)
        if locacoes_cliente:
            logger.info(f"Locações encontradas para o cliente ID {cliente_id}: {len(locacoes_cliente)}")
            return jsonify(locacoes_cliente), 200
        else:
            logger.warning(f"Nenhuma locação encontrada para o cliente ID {cliente_id}.")
            return jsonify([]), 404
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar locações para o cliente ID {cliente_id}: {ex}")
        return jsonify({"error": "Erro ao buscar locações para o cliente."}), 500

@locacoes_routes.route('/<int:locacao_id>', methods=['GET'])
def get_locacao_detalhes(locacao_id):
    """Rota para obter detalhes específicos de uma locação."""
    try:
        locacao = Locacao.get_detailed_by_id(locacao_id)
        if not locacao:
            return jsonify({"error": "Locação não encontrada"}), 404
        return jsonify(locacao), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao obter detalhes da locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao buscar detalhes da locação."}), 500

@locacoes_routes.route('/ativos', methods=['GET'])
def get_locacoes_ativas():
    """Rota para listar todas as locações ativas (data_fim >= data atual)."""
    try:
        locacoes_ativas = Locacao.get_active_locacoes()
        logger.info(f"Locações ativas encontradas: {len(locacoes_ativas)}")
        return jsonify(locacoes_ativas), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar locações ativas: {ex}")
        return jsonify({"error": "Erro ao buscar locações ativas."}), 500

@locacoes_routes.route('/alertas', methods=['GET'])
def get_locacoes_com_alertas():
    """Rota para listar locações finalizadas sem devolução registrada."""
    try:
        locacoes_com_alertas = Locacao.get_locacoes_sem_devolucao()
        logger.info(f"Locações com alertas encontradas: {len(locacoes_com_alertas)}")
        return jsonify(locacoes_com_alertas), 200
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar locações com alertas: {ex}")
        return jsonify({"error": "Erro ao buscar locações com alertas."}), 500

@locacoes_routes.route('', methods=['POST'])
@locacoes_routes.route('/', methods=['POST'])
def add_locacao():
    """Rota para adicionar uma nova locação."""
    try:
        nova_locacao = request.get_json()
        logger.info(f"Dados da nova locação recebidos: {nova_locacao}")

        cliente_info = nova_locacao.get('cliente', {})
        nome_cliente = cliente_info.get('nome')
        telefone_cliente = cliente_info.get('telefone')

        if not nome_cliente or not telefone_cliente:
            logger.warning("Nome e telefone do cliente são obrigatórios!")
            return jsonify({"error": "Nome e telefone do cliente são obrigatórios!"}), 400

        # Criação do cliente
        cliente_id = Cliente.create(
            nome=nome_cliente,
            endereco=cliente_info.get('endereco'),
            telefone=telefone_cliente,
            referencia=cliente_info.get('referencia'),
            email=cliente_info.get('email')
        )
        if cliente_id is None:
            logger.error("Erro ao criar o cliente")
            return jsonify({"error": "Erro ao criar o cliente"}), 500

        logger.info(f"Cliente criado com sucesso: ID {cliente_id}")

        # Verificação dos itens da locação
        itens_locados = nova_locacao.get('itens', [])
        if not nova_locacao.get('data_inicio') or not nova_locacao.get('data_fim') or nova_locacao.get('valor_total') is None or not itens_locados:
            logger.warning("Todos os campos da locação e itens são obrigatórios!")
            return jsonify({"error": "Todos os campos da locação e itens são obrigatórios!"}), 400

        # Criação da locação
        locacao_id = Locacao.create(
            cliente_id=cliente_id,
            data_inicio=nova_locacao.get('data_inicio'),
            data_fim=nova_locacao.get('data_fim'),
            valor_total=nova_locacao.get('valor_total'),
            valor_pago_entrega=nova_locacao.get('valor_pago_entrega'),
            valor_receber_final=nova_locacao.get('valor_receber_final'),
            status="ativo"
        )
        if locacao_id is None:
            logger.error("Erro ao criar a locação!")
            return jsonify({"error": "Erro ao criar a locação!"}), 500

        logger.info(f"Locação criada com sucesso: ID {locacao_id}")

        # Adicionando itens à locação e atualizando estoque
        for item in itens_locados:
            item_id = item.get('item_id')
            quantidade = item.get('quantidade')

            if not item_id or quantidade is None or quantidade <= 0:
                logger.warning("ID do item e quantidade são obrigatórios e a quantidade deve ser positiva.")
                return jsonify({"error": "ID do item e quantidade são obrigatórios!"}), 400

            # Verificar se o item existe no inventário
            item_inventario = Inventario.get_item_by_id(item_id)
            if item_inventario is None:
                logger.warning(f"Item não encontrado no inventário: ID {item_id}")
                return jsonify({"error": f"Item não encontrado no inventário: ID {item_id}"}), 400

            # Adicionar item à locação
            ItensLocados.add_item(locacao_id, item_id, quantidade)
            
            # Atualizar o estoque
            estoque_atualizado = Inventario.atualizar_estoque(item_id, quantidade)
            if not estoque_atualizado:
                logger.error(f"Erro ao atualizar estoque para o item ID {item_id}")
                return jsonify({"error": f"Erro ao atualizar estoque para o item ID {item_id}"}), 500

            logger.info(f"Estoque reduzido para o item ID {item_id}, quantidade: {quantidade}")

        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        logger.info("Locação adicionada com sucesso!")
        return jsonify({"message": "Locação adicionada com sucesso!", "inventario": inventario}), 201

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao adicionar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/confirmar-devolucao', methods=['PATCH'])
def confirmar_devolucao(locacao_id):
    """Confirma a devolução e atualiza o status da locação para 'concluido'."""
    try:
        locacao = Locacao.get_detailed_by_id(locacao_id)
        if not locacao:
            return jsonify({"error": "Locação não encontrada"}), 404

        status_atualizado = Locacao.update_status(locacao_id, "concluido")  # Atualizando para 'concluido'
        if not status_atualizado:
            return jsonify({"error": "Erro ao atualizar status da locação."}), 500

        devolucao_confirmada = Locacao.atualizar_estoque_devolucao(locacao_id)
        if not devolucao_confirmada:
            return jsonify({"error": "Erro ao confirmar devolução e atualizar estoque."}), 500

        inventario = Inventario.get_all()
        logger.info(f"Devolução confirmada e estoque atualizado para a locação ID {locacao_id}.")
        return jsonify({"message": "Devolução confirmada e estoque atualizado!", "inventario": inventario}), 200

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao confirmar devolução para locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao confirmar devolução para locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao confirmar devolução."}), 500

@locacoes_routes.route('/<int:locacao_id>/reativar', methods=['PATCH'])
def reativar_locacao(locacao_id):
    """Reativa uma locação, altera o status para 'ativo' e remove os itens do estoque novamente."""
    try:
        locacao = Locacao.get_detailed_by_id(locacao_id)
        
        if not locacao or locacao['status'] != 'concluido':
            return jsonify({"error": "Locação não encontrada ou não está concluída"}), 404

        status_atualizado = Locacao.update_status(locacao_id, "ativo")
        if not status_atualizado:
            return jsonify({"error": "Erro ao atualizar status da locação."}), 500

        for item in locacao.get('itens', []):
            item_id = item.get('item_id')
            quantidade = item.get('quantidade')
            
            if item_id is None or quantidade is None:
                logger.warning(f"Item com dados incompletos ao reativar locação ID {locacao_id}: {item}")
                continue

            estoque_atualizado = Inventario.atualizar_estoque(item_id, quantidade)
            if not estoque_atualizado:
                logger.error(f"Erro ao atualizar estoque para o item ID {item_id}")
                return jsonify({"error": f"Erro ao atualizar estoque para o item ID {item_id}"}), 500

            logger.info(f"Estoque reduzido novamente para o item ID {item_id}, quantidade: {quantidade}")

        inventario = Inventario.get_all()
        logger.info(f"Locação ID {locacao_id} reativada e estoque ajustado.")
        return jsonify({"message": "Locação reativada e estoque ajustado!", "inventario": inventario}), 200

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao reativar locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao reativar locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro ao reativar locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/finalizar_antecipadamente', methods=['PUT'])
def finalizar_antecipadamente(locacao_id):
    """Rota para finalizar uma locação antecipadamente e atualizar data de término e valor final."""
    try:
        dados = request.get_json()
        nova_data_fim = dados.get('nova_data_fim')
        novo_valor_final = dados.get('novo_valor_final')
        motivo_ajuste_valor = dados.get('motivo_ajuste_valor')

        if not nova_data_fim or novo_valor_final is None:
            return jsonify({"error": "Nova data de término e novo valor final são obrigatórios!"}), 400

        resultado = Locacao.finalizar_antecipadamente(locacao_id, nova_data_fim, novo_valor_final, motivo_ajuste_valor)

        if resultado.get("sucesso"):
            locacao_atualizada = Locacao.get_detailed_by_id(locacao_id)
            return jsonify({
                "message": "Locação finalizada antecipadamente com sucesso!",
                "data_devolucao_efetiva": resultado["data_devolucao_efetiva"],
                "valor_final_ajustado": resultado["valor_final_ajustado"],
                "locacao": locacao_atualizada
            }), 200
        else:
            return jsonify({"error": resultado.get("mensagem", "Erro ao finalizar locação.")}), 500

    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao finalizar antecipadamente a locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao finalizar antecipadamente a locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao finalizar antecipadamente a locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/prorrogar', methods=['PUT'])
def prorrogar_locacao(locacao_id):
    """Rota para prorrogar uma locação com ajuste de valor e abatimento."""
    try:
        dados = request.get_json()
        dias_adicionais = dados.get('dias_adicionais')
        novo_valor_total = dados.get('novo_valor_total')
        abatimento = dados.get('abatimento', 0)
        motivo_ajuste_valor = dados.get('motivo_ajuste_valor')

        if dias_adicionais is None or novo_valor_total is None:
            return jsonify({"error": "Parâmetros obrigatórios faltando (dias adicionais e novo valor total)."}), 400

        resultado = Locacao.extend(locacao_id, dias_adicionais, novo_valor_total, abatimento, motivo_ajuste_valor)
        
        if resultado.get("sucesso"):
            locacao_atualizada = Locacao.get_detailed_by_id(locacao_id)
            return jsonify({
                "message": "Locação prorrogada com sucesso!",
                "nova_data_fim": resultado["nova_data_fim"],
                "valor_final_ajustado": resultado["valor_final_ajustado"],
                "valor_abatimento": resultado["valor_abatimento"],
                "locacao": locacao_atualizada
            }), 200
        else:
            return jsonify({"error": resultado.get("mensagem", "Erro ao prorrogar locação.")}), 500
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao prorrogar locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao prorrogar locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao prorrogar locação."}), 500
