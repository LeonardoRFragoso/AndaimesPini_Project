from flask import Blueprint, request, jsonify
from models import Cliente, Inventario, Locacao, ItensLocados, RegistroDanos
from database import create_connection
import psycopg2

# Criação do blueprint para as rotas
routes = Blueprint('routes', __name__)

# Rotas para clientes
@routes.route('/clientes', methods=['GET'])
def get_clientes():
    try:
        clientes = Cliente.get_all()
        return jsonify(clientes), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar clientes no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar clientes: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar clientes: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/clientes', methods=['POST'])
def add_cliente():
    try:
        novo_cliente = request.get_json()
        nome = novo_cliente.get('nome')
        endereco = novo_cliente.get('endereco')
        telefone = novo_cliente.get('telefone')
        referencia = novo_cliente.get('referencia')

        if not nome or not telefone:
            return jsonify({"error": "Nome e telefone são campos obrigatórios!"}), 400

        cliente_id = Cliente.create(nome, endereco, telefone, referencia)
        if cliente_id is None:
            return jsonify({"error": "Erro ao adicionar o cliente!"}), 500

        return jsonify({"message": "Cliente adicionado com sucesso!", "cliente_id": cliente_id}), 201
    except psycopg2.Error as e:
        print(f"Erro ao adicionar cliente: {e}")
        return jsonify({"error": f"Erro ao adicionar cliente: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao adicionar cliente: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

# Rotas para inventário
@routes.route('/inventario', methods=['GET'])
def get_inventario():
    try:
        inventario = Inventario.get_all()
        return jsonify(inventario), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar inventário no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar inventário: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar inventário: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/inventario', methods=['POST'])
def add_inventario():
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
        print(f"Erro ao adicionar item ao inventário: {e}")
        return jsonify({"error": f"Erro ao adicionar item ao inventário: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao adicionar item ao inventário: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

# Rotas para locações
@routes.route('/locacoes', methods=['GET'])
def get_locacoes():
    try:
        locacoes = Locacao.get_all()
        return jsonify(locacoes), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar locações no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar locações: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar locações: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/locacoes/<int:locacao_id>/itens', methods=['GET'])
def get_itens_locados(locacao_id):
    try:
        itens_locados = ItensLocados.get_by_locacao(locacao_id)
        return jsonify(itens_locados), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar itens locados no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar itens locados: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar itens locados: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/locacoes', methods=['POST'])
def add_locacao():
    try:
        nova_locacao = request.get_json()
        
        # Dados principais da locação
        numero_nota = nova_locacao.get('numero_nota')
        cliente_info = nova_locacao.get('cliente_info')
        data_inicio = nova_locacao.get('data_inicio')
        data_fim = nova_locacao.get('data_fim')
        valor_total = nova_locacao.get('valor_total')
        itens_locados = nova_locacao.get('itens')
        
        # Validação de itens com estoque
        for item in itens_locados:
            modelo_item = item.get('modelo')
            quantidade = item.get('quantidade')
            item_id = Inventario.get_item_id_by_modelo(modelo_item)
            
            # Verifica se o item está no inventário e se a quantidade é suficiente
            if item_id is None or not Inventario.validar_estoque(item_id, quantidade):
                return jsonify({"error": f"Estoque insuficiente para o item: {modelo_item}"}), 400
        
        # Continua com o processo de criação da locação se o estoque estiver OK
        cliente_id = Cliente.create(cliente_info['nome'], cliente_info.get('endereco'), cliente_info['telefone'], cliente_info.get('referencia'))
        locacao_id = Locacao.create(cliente_id, data_inicio, data_fim, valor_total)

        for item in itens_locados:
            modelo_item = item.get('modelo')
            quantidade = item.get('quantidade')
            item_id = Inventario.get_item_id_by_modelo(modelo_item)
            ItensLocados.add_item(locacao_id, item_id, quantidade)
            Inventario.reduzir_estoque(item_id, quantidade)
        
        return jsonify({"message": "Locação adicionada com sucesso!"}), 201
    except Exception as e:
        print(f"Erro ao processar locação: {e}")
        return jsonify({"error": "Erro ao processar locação"}), 500


# Rotas para registro de danos
@routes.route('/danos', methods=['POST'])
def add_dano():
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
        return jsonify({"error": f"Erro ao registrar dano: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao registrar dano: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/danos/<int:locacao_id>', methods=['GET'])
def get_danos(locacao_id):
    try:
        danos = RegistroDanos.get_by_locacao(locacao_id)
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar danos no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar danos: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar danos: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500

@routes.route('/danos', methods=['GET'])
def get_all_danos():
    try:
        danos = RegistroDanos.get_all()
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar todos os danos no banco de dados: {e}")
        return jsonify({"error": f"Erro ao buscar todos os danos: {e}"}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar todos os danos: {ex}")
        return jsonify({"error": f"Erro inesperado: {ex}"}), 500
