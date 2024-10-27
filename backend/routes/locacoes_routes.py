from flask import Blueprint, request, jsonify
from models import Cliente, Inventario, Locacao, ItensLocados
from helpers import atualizar_estoque, restaurar_estoque, handle_database_error
import psycopg2
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)

# Criação do blueprint para as rotas de locação
locacoes_routes = Blueprint('locacoes_routes', __name__, url_prefix='/locacoes')

@locacoes_routes.route('', methods=['GET'])
@locacoes_routes.route('/', methods=['GET'])
def get_locacoes():
    """Rota para listar todas as locações (pedidos)."""
    try:
        locacoes = Locacao.get_all()
        logging.info(f"Locações encontradas: {locacoes}")
        return jsonify(locacoes), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logging.error(f"Erro inesperado ao buscar locações: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar locações."}), 500

@locacoes_routes.route('', methods=['POST'])
@locacoes_routes.route('/', methods=['POST'])
def add_locacao():
    """Rota para adicionar uma nova locação."""
    try:
        nova_locacao = request.get_json()
        logging.info(f"Dados da nova locação recebidos: {nova_locacao}")

        # Validação de campos obrigatórios para cliente
        cliente_info = nova_locacao.get('cliente_info', {})
        nome_cliente = cliente_info.get('nome')
        telefone_cliente = cliente_info.get('telefone')

        if not nome_cliente or not telefone_cliente:
            logging.warning("Nome e telefone do cliente são obrigatórios!")
            return jsonify({"error": "Nome e telefone do cliente são obrigatórios!"}), 400

        # Criação do cliente
        cliente_id = Cliente.create(
            nome_cliente, 
            cliente_info.get('endereco'), 
            telefone_cliente, 
            cliente_info.get('referencia')
        )
        if cliente_id is None:
            logging.error("Erro ao criar o cliente")
            return jsonify({"error": "Erro ao criar o cliente"}), 500

        logging.info(f"Cliente criado com sucesso: ID {cliente_id}")

        # Validação de campos obrigatórios para locação
        itens_locados = nova_locacao.get('itens', [])
        if not nova_locacao.get('data_inicio') or not nova_locacao.get('data_fim') or nova_locacao.get('valor_total') is None or not itens_locados:
            logging.warning("Todos os campos da locação e itens são obrigatórios!")
            return jsonify({"error": "Todos os campos da locação e itens são obrigatórios!"}), 400

        # Criação da locação
        locacao_id = Locacao.create(
            cliente_id, 
            nova_locacao['data_inicio'], 
            nova_locacao['data_fim'], 
            nova_locacao['valor_total']
        )
        if locacao_id is None:
            logging.error("Erro ao criar a locação!")
            return jsonify({"error": "Erro ao criar a locação!"}), 500

        logging.info(f"Locação criada com sucesso: ID {locacao_id}")

        # Processamento de itens locados e atualização de estoque
        for item in itens_locados:
            modelo_item = item.get('modelo')
            quantidade = item.get('quantidade')

            if not modelo_item or quantidade is None or quantidade <= 0:
                logging.warning("Modelo e quantidade do item são obrigatórios e a quantidade deve ser positiva.")
                return jsonify({"error": "Modelo e quantidade do item são obrigatórios!"}), 400

            item_id = Inventario.get_item_id_by_modelo(modelo_item)
            if item_id is None:
                logging.warning(f"Item não encontrado no inventário: {modelo_item}")
                return jsonify({"error": f"Item não encontrado no inventário: {modelo_item}"}), 400

            ItensLocados.add_item(locacao_id, item_id, quantidade)
            atualizar_estoque(item_id, quantidade)
            logging.info(f"Item {modelo_item} adicionado à locação ID {locacao_id} e estoque atualizado.")

        logging.info("Locação adicionada com sucesso!")
        return jsonify({"message": "Locação adicionada com sucesso!"}), 201

    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logging.error(f"Erro inesperado ao adicionar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar locação."}), 500

@locacoes_routes.route('/<int:locacao_id>/devolucao', methods=['POST'])
def devolver_locacao(locacao_id):
    """Rota para registrar a devolução de um item em uma locação."""
    try:
        dados = request.get_json()
        item_id = dados.get('item_id')

        if not item_id:
            logging.warning("Item ID é obrigatório!")
            return jsonify({"error": "Item ID é obrigatório!"}), 400

        ItensLocados.return_item(locacao_id, item_id)
        restaurar_estoque(item_id, 1)
        logging.info(f"Devolução registrada com sucesso para item ID {item_id} na locação ID {locacao_id}.")
        return jsonify({"message": "Devolução registrada com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logging.error(f"Erro inesperado ao registrar devolução: {ex}")
        return jsonify({"error": "Erro inesperado ao registrar devolução."}), 500

@locacoes_routes.route('/<int:locacao_id>/prorrogacao', methods=['PUT'])
def prorrogar_locacao(locacao_id):
    """Rota para prorrogar uma locação existente."""
    try:
        dados = request.get_json()
        dias_adicionais = dados.get('dias_adicionais')

        if dias_adicionais is None or dias_adicionais <= 0:
            logging.warning("Dias adicionais devem ser positivos!")
            return jsonify({"error": "Dias adicionais devem ser positivos!"}), 400

        Locacao.extend(locacao_id, dias_adicionais)
        logging.info(f"Locação ID {locacao_id} prorrogada com sucesso por {dias_adicionais} dias.")
        return jsonify({"message": "Locação prorrogada com sucesso!"}), 200
    except psycopg2.Error as e:
        return handle_database_error(e)
    except Exception as ex:
        logging.error(f"Erro inesperado ao prorrogar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao prorrogar locação."}), 500
