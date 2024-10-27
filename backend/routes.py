from flask import Blueprint, request, jsonify
from models import Cliente, Inventario, Locacao, ItensLocados, RegistroDanos
from database import get_connection, release_connection
import psycopg2

# Criação do blueprint para as rotas
routes = Blueprint('routes', __name__)

# Função auxiliar para atualizar o estoque
def atualizar_estoque(item_id, quantidade_retirada):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE inventario SET quantidade = quantidade - %s 
            WHERE id = %s AND quantidade >= %s
        ''', (quantidade_retirada, item_id, quantidade_retirada))
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Erro ao atualizar o estoque: {e}")
    finally:
        cursor.close()
        release_connection(conn)

# Função auxiliar para restaurar o estoque
def restaurar_estoque(item_id, quantidade):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            UPDATE inventario SET quantidade = quantidade + %s 
            WHERE id = %s
        ''', (quantidade, item_id))
        conn.commit()
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Erro ao restaurar o estoque: {e}")
    finally:
        cursor.close()
        release_connection(conn)

# Rotas para inventário (CRUD completo)

# Listar todos os itens do inventário
@routes.route('/inventario', methods=['GET'])
def get_inventario():
    try:
        inventario = Inventario.get_all()
        return jsonify(inventario), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar inventário no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar inventário."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar inventário: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar inventário."}), 500

# Adicionar um novo item ao inventário
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
        return jsonify({"error": "Erro ao adicionar item ao inventário."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao adicionar item ao inventário: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar item ao inventário."}), 500

# Atualizar a quantidade de um item específico no inventário
@routes.route('/inventario/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    try:
        dados = request.get_json()
        nova_quantidade = dados.get('quantidade')
        
        if nova_quantidade is None:
            return jsonify({"error": "Quantidade é obrigatória!"}), 400

        Inventario.update_quantidade(item_id, nova_quantidade)
        return jsonify({"message": "Quantidade do item atualizada com sucesso!"}), 200
    except psycopg2.Error as e:
        print(f"Erro ao atualizar quantidade do item no inventário: {e}")
        return jsonify({"error": "Erro ao atualizar item."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao atualizar item: {ex}")
        return jsonify({"error": "Erro inesperado ao atualizar item."}), 500

# Deletar um item do inventário
@routes.route('/inventario/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT * FROM inventario WHERE id = %s', (item_id,))
        item = cursor.fetchone()
        if not item:
            return jsonify({"error": "Item não encontrado no inventário."}), 404

        cursor.execute('DELETE FROM inventario WHERE id = %s', (item_id,))
        conn.commit()
        return jsonify({"message": "Item excluído com sucesso!"}), 200
    except psycopg2.Error as e:
        conn.rollback()
        print(f"Erro ao excluir item do inventário: {e}")
        return jsonify({"error": "Erro ao excluir item."}), 500
    finally:
        cursor.close()
        release_connection(conn)

# Rota para listar apenas itens disponíveis (quantidade > 0)
@routes.route('/inventario/disponiveis', methods=['GET'])
def get_inventario_disponiveis():
    try:
        inventario_disponivel = Inventario.get_available()
        return jsonify(inventario_disponivel), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar inventário disponível no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar inventário disponível."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar inventário disponível: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar inventário disponível."}), 500

# Rotas para clientes
@routes.route('/clientes', methods=['GET'])
def get_clientes():
    try:
        clientes = Cliente.get_all()
        return jsonify(clientes), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar clientes no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar clientes."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar clientes: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar clientes."}), 500

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
        return jsonify({"error": "Erro ao adicionar cliente."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao adicionar cliente: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar cliente."}), 500

# Rotas para locações
@routes.route('/locacoes', methods=['POST'])
def add_locacao():
    try:
        nova_locacao = request.get_json()
        print(f"Recebendo nova locação: {nova_locacao}")

        numero_nota = nova_locacao.get('numero_nota')
        cliente_info = nova_locacao.get('cliente_info')
        data_inicio = nova_locacao.get('data_inicio')
        dias_combinados = nova_locacao.get('dias_combinados')
        data_fim = nova_locacao.get('data_fim')
        valor_total = nova_locacao.get('valor_total')
        itens_locados = nova_locacao.get('itens')

        nome_cliente = cliente_info.get('nome')
        telefone_cliente = cliente_info.get('telefone')

        if not nome_cliente or not telefone_cliente:
            return jsonify({"error": "Nome e telefone do cliente são obrigatórios!"}), 400

        cliente_id = Cliente.create(nome_cliente, cliente_info.get('endereco'), telefone_cliente, cliente_info.get('referencia'))
        if cliente_id is None:
            return jsonify({"error": "Erro ao criar o cliente"}), 500

        if not numero_nota or not data_inicio or not data_fim or valor_total is None or not itens_locados:
            return jsonify({"error": "Todos os campos da locação são obrigatórios!"}), 400

        locacao_id = Locacao.create(cliente_id, data_inicio, data_fim, valor_total)
        if locacao_id is None:
            return jsonify({"error": "Erro ao criar a locação!"}), 500

        for item in itens_locados:
            modelo_item = item.get('modelo')
            quantidade = item.get('quantidade')
            unidade = item.get('unidade')

            if quantidade is None or unidade is None:
                return jsonify({"error": "Quantidade e unidade são obrigatórias para todos os itens!"}), 400

            item_id = Inventario.get_item_id_by_modelo(modelo_item)
            if item_id is None:
                print(f"Item não encontrado no inventário: {modelo_item}")
                return jsonify({"error": f"Item não encontrado no inventário: {modelo_item}"}), 400

            ItensLocados.add_item(locacao_id, item_id, quantidade)
            
            # Atualizar o estoque do item
            atualizar_estoque(item_id, quantidade)

        return jsonify({"message": "Locação adicionada com sucesso!"}), 201

    except psycopg2.Error as e:
        print(f"Erro ao adicionar locação no banco de dados: {e}")
        return jsonify({"error": "Erro ao adicionar locação."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao adicionar locação: {ex}")
        return jsonify({"error": "Erro inesperado ao adicionar locação."}), 500

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
        return jsonify({"error": "Erro ao registrar dano."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao registrar dano: {ex}")
        return jsonify({"error": "Erro inesperado ao registrar dano."}), 500

@routes.route('/danos/<int:locacao_id>', methods=['GET'])
def get_danos(locacao_id):
    try:
        danos = RegistroDanos.get_by_locacao(locacao_id)
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar danos no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar danos."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar danos: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar danos."}), 500

@routes.route('/danos', methods=['GET'])
def get_all_danos():
    try:
        danos = RegistroDanos.get_all()
        return jsonify(danos), 200
    except psycopg2.Error as e:
        print(f"Erro ao buscar todos os danos no banco de dados: {e}")
        return jsonify({"error": "Erro ao buscar todos os danos."}), 500
    except Exception as ex:
        print(f"Erro inesperado ao buscar todos os danos: {ex}")
        return jsonify({"error": "Erro inesperado ao buscar todos os danos."}), 500
