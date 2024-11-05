from flask import Blueprint, request, jsonify
from models import Cliente, Inventario, Locacao, ItensLocados, RegistroDanos
from helpers import atualizar_estoque, restaurar_estoque, handle_database_error
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
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao buscar locações: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar locações."}), 500

@locacoes_routes.route('/cliente/<int:client_id>', methods=['GET'])
def get_locacoes_por_cliente(client_id):
    """Rota para listar todas as locações de um cliente específico."""
    try:
        locacoes_cliente = Locacao.get_by_client_id(client_id)
        if locacoes_cliente:
            logger.info(f"Locações encontradas para o cliente ID {client_id}: {len(locacoes_cliente)}")
            return jsonify(locacoes_cliente), 200
        else:
            logger.warning(f"Nenhuma locação encontrada para o cliente ID {client_id}.")
            return jsonify([]), 404
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao buscar locações para o cliente ID {client_id}: {ex}")
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

        cliente_info = nova_locacao.get('cliente_info', {})
        nome_cliente = cliente_info.get('nome')
        telefone_cliente = cliente_info.get('telefone')

        if not nome_cliente or not telefone_cliente:
            logger.warning("Nome e telefone do cliente são obrigatórios!")
            return jsonify({"error": "Nome e telefone do cliente são obrigatórios!"}), 400

        # Criação do cliente
        cliente_id = Cliente.create(
            nome_cliente, 
            cliente_info.get('endereco'), 
            telefone_cliente, 
            cliente_info.get('referencia')
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
            modelo_item = item.get('modelo')
            quantidade = item.get('quantidade')

            if not modelo_item or quantidade is None or quantidade <= 0:
                logger.warning("Modelo e quantidade do item são obrigatórios e a quantidade deve ser positiva.")
                return jsonify({"error": "Modelo e quantidade do item são obrigatórios!"}), 400

            # Obter item do inventário
            item_id = Inventario.get_item_id_by_modelo(modelo_item)
            if item_id is None:
                logger.warning(f"Item não encontrado no inventário: {modelo_item}")
                return jsonify({"error": f"Item não encontrado no inventário: {modelo_item}"}), 400

            # Adicionar item à locação
            ItensLocados.add_item(locacao_id, item_id, quantidade)
            
            # Atualizar o estoque usando a função correta
            try:
                Inventario.atualizar_estoque(item_id, quantidade)
                logger.info(f"Estoque reduzido para o item {modelo_item}, quantidade: {quantidade}")
            except ValueError as e:
                logger.error(f"Estoque insuficiente para o item {modelo_item}. Quantidade solicitada: {quantidade}")
                return jsonify({"error": f"Estoque insuficiente para o item {modelo_item}"}), 400
            except Exception as ex:
                logger.error(f"Erro ao atualizar estoque para o item {modelo_item}: {ex}")
                return jsonify({"error": f"Erro ao atualizar estoque para o item {modelo_item}"}), 500

        # Retorne o inventário atualizado
        inventario = Inventario.get_all()
        logger.info("Locação adicionada com sucesso!")
        return jsonify({"message": "Locação adicionada com sucesso!", "inventario": inventario}), 201

    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao adicionar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/confirmar-devolucao', methods=['PATCH'])
def confirmar_devolucao(locacao_id):
    """Confirma a devolução e atualiza o status da locação para 'concluído'."""
    try:
        locacao = Locacao.get_detailed_by_id(locacao_id)
        if not locacao:
            return jsonify({"error": "Locação não encontrada"}), 404

        status_atualizado = Locacao.update_status(locacao_id, "concluído")
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
        
        if not locacao or locacao['status'] != 'concluído':
            return jsonify({"error": "Locação não encontrada ou não está concluída"}), 404

        status_atualizado = Locacao.update_status(locacao_id, "ativo")
        if not status_atualizado:
            return jsonify({"error": "Erro ao atualizar status da locação."}), 500

        itens_com_dados_incompletos = 0
        for item in locacao.get('itens', []):
            item_id = item.get('item_id')
            quantidade = item.get('quantidade')
            
            if item_id is None or quantidade is None:
                itens_com_dados_incompletos += 1
                logger.warning(f"Item com dados incompletos ao reativar locação ID {locacao_id}: {item}")
                continue

            atualizar_estoque(item_id, quantidade)
            logger.info(f"Estoque atualizado para o item ID {item_id}, quantidade: -{quantidade}")

        if itens_com_dados_incompletos > 0:
            logger.warning(f"{itens_com_dados_incompletos} itens com dados incompletos foram ignorados ao reativar locação ID {locacao_id}.")

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

        if not nova_data_fim or novo_valor_final is None:
            return jsonify({"error": "Nova data de término e novo valor final são obrigatórios!"}), 400

        resultado = Locacao.finalizar_antecipadamente(locacao_id, nova_data_fim, novo_valor_final)

        if resultado.get("sucesso"):
            locacao_atualizada = Locacao.get_detailed_by_id(locacao_id)
            logger.info(f"Locação ID {locacao_id} finalizada antecipadamente com sucesso.")
            return jsonify({
                "message": "Locação finalizada antecipadamente com sucesso!",
                "data_devolucao_efetiva": resultado["data_devolucao_efetiva"],
                "valor_final_ajustado": resultado["valor_final_ajustado"],
                "locacao": locacao_atualizada
            }), 200
        else:
            logger.warning(f"Locação ID {locacao_id} não encontrada para finalização antecipada.")
            return jsonify({"error": "Locação não encontrada."}), 404
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao finalizar antecipadamente a locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao finalizar antecipadamente a locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao finalizar antecipadamente a locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/problema', methods=['POST'])
def reportar_problema(locacao_id):
    """Rota para registrar um problema em um item locado."""
    try:
        dados = request.get_json()
        item_id = dados.get('item_id')
        descricao_problema = dados.get('descricao_problema')

        if not item_id or not descricao_problema:
            logger.warning("Item ID e descrição do problema são obrigatórios!")
            return jsonify({"error": "Item ID e descrição do problema são obrigatórios!"}), 400

        RegistroDanos.add_problem(locacao_id, item_id, descricao_problema)
        logger.info(f"Problema registrado para item ID {item_id} na locação ID {locacao_id}.")
        return jsonify({"message": "Problema registrado com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro ao registrar problema: {ex}")
        return jsonify({"error": "Erro ao registrar problema."}), 500

@locacoes_routes.route('/<int:locacao_id>/prorrogar', methods=['PUT', 'OPTIONS'])
def prorrogar_locacao(locacao_id):
    """Rota para prorrogar a data de término de uma locação e atualizar o valor total."""
    if request.method == 'OPTIONS':
        # Responde diretamente a uma requisição OPTIONS para CORS
        return jsonify({"status": "OK"}), 200

    try:
        dados = request.get_json()
        dias_adicionais = dados.get('dias_adicionais')
        novo_valor_total = dados.get('novo_valor_total')
        abatimento = dados.get('abatimento', 0)

        # Logging para depuração
        logger.info(f"Prorrogação solicitada para locação {locacao_id}: dias_adicionais={dias_adicionais}, novo_valor_total={novo_valor_total}, abatimento={abatimento}")

        if dias_adicionais is None or novo_valor_total is None:
            return jsonify({"error": "Dias adicionais e novo valor total são obrigatórios!"}), 400

        # Chama o método extend do modelo Locacao
        resultado = Locacao.extend(locacao_id, dias_adicionais, novo_valor_total, abatimento)

        if resultado.get("sucesso"):
            locacao_atualizada = Locacao.get_detailed_by_id(locacao_id)
            logger.info(f"Locação ID {locacao_id} prorrogada com sucesso.")
            return jsonify({
                "message": "Locação prorrogada com sucesso!",
                "nova_data_fim": resultado["nova_data_fim"],
                "valor_final_ajustado": resultado["valor_final_ajustado"],
                "valor_abatimento": resultado["valor_abatimento"],
                "locacao": locacao_atualizada
            }), 200
        else:
            logger.warning(f"Locação ID {locacao_id} não encontrada para prorrogação.")
            return jsonify({"error": "Locação não encontrada."}), 404
    except psycopg2.Error as e:
        logger.error(f"Erro no banco de dados ao prorrogar a locação ID {locacao_id}: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao prorrogar a locação ID {locacao_id}: {ex}")
        return jsonify({"error": "Erro inesperado ao prorrogar locação."}), 500
