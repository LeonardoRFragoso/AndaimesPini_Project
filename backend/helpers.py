from database import get_connection, release_connection
import psycopg2
from flask import jsonify
from models.locacao import Locacao
from models.registro_danos import RegistroDanos
from models.itens_locados import ItensLocados
import logging

def atualizar_estoque(item_id, quantidade_retirada):
    """
    Atualiza a quantidade de um item no estoque, subtraindo a quantidade retirada.
    """
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
        logging.error(f"Erro ao atualizar o estoque: {e}")
        return jsonify({"error": "Erro ao atualizar o estoque"}), 500
    finally:
        cursor.close()
        release_connection(conn)
    return jsonify({"message": "Estoque atualizado com sucesso"}), 200

def restaurar_estoque(item_id, quantidade):
    """
    Restaura a quantidade de um item no estoque, adicionando a quantidade especificada.
    """
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
        logging.error(f"Erro ao restaurar o estoque: {e}")
        return jsonify({"error": "Erro ao restaurar o estoque"}), 500
    finally:
        cursor.close()
        release_connection(conn)
    return jsonify({"message": "Estoque restaurado com sucesso"}), 200

def handle_database_error(error):
    """
    Tratamento centralizado de erros de banco de dados.
    """
    logging.error(f"Erro no banco de dados: {error}")
    return jsonify({"error": "Erro no banco de dados"}), 500

def get_record_by_id(table, record_id):
    """
    Função auxiliar para buscar um registro específico em uma tabela pelo ID.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f'SELECT * FROM {table} WHERE id = %s', (record_id,))
        record = cursor.fetchone()
    except psycopg2.Error as e:
        logging.error(f"Erro ao buscar registro no banco de dados: {e}")
        return None
    finally:
        cursor.close()
        release_connection(conn)
    return record

def delete_record(table, record_id):
    """
    Função auxiliar para excluir um registro em uma tabela pelo ID.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f'DELETE FROM {table} WHERE id = %s', (record_id,))
        conn.commit()
        return True
    except psycopg2.Error as e:
        conn.rollback()
        logging.error(f"Erro ao excluir registro do banco de dados: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)

# Novas funções para atender a visualização e atualização de locações

def get_all_locacoes():
    """
    Retorna todas as locações completas para exibição na página de pedidos.
    """
    try:
        return Locacao.get_all()
    except Exception as e:
        logging.error(f"Erro ao buscar todas as locações: {e}")
        return []

def get_locacoes_ativas():
    """
    Retorna apenas as locações ativas (data_fim >= data atual).
    """
    try:
        return Locacao.get_active_locacoes()
    except Exception as e:
        logging.error(f"Erro ao buscar locações ativas: {e}")
        return []

def get_locacoes_com_alertas():
    """
    Retorna locações finalizadas sem devolução registrada para exibir alertas.
    """
    try:
        return Locacao.get_locacoes_sem_devolucao()
    except Exception as e:
        logging.error(f"Erro ao buscar locações com alertas: {e}")
        return []

def atualizar_status_locacao(locacao_id, status, descricao=None, dias_adicionais=None):
    """
    Atualiza o status de uma locação específica.
    - 'devolvido': Marcar todos os itens como devolvidos.
    - 'problema': Registrar um problema no item com descrição detalhada.
    - 'prorrogado': Prorrogar a locação em dias adicionais especificados.
    """
    try:
        if status == 'devolvido':
            # Marcar todos os itens como devolvidos e restaurar o estoque
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            for item in itens_locados:
                item_id = item['item_id']
                quantidade = item['quantidade']
                ItensLocados.return_item(locacao_id, item_id)
                restaurar_estoque(item_id, quantidade)
            logging.info(f"Locação ID {locacao_id} marcada como devolvida.")
        
        elif status == 'problema' and descricao:
            # Registrar problema
            RegistroDanos.add_problem(locacao_id, item['item_id'], descricao)
            logging.info(f"Problema registrado para locação ID {locacao_id}.")

        elif status == 'prorrogado' and dias_adicionais:
            # Prorrogar a locação
            Locacao.extend(locacao_id, dias_adicionais)
            logging.info(f"Locação ID {locacao_id} prorrogada por {dias_adicionais} dias.")
        
        else:
            logging.warning("Parâmetros inválidos para atualizar status da locação.")
            return False
        
        return True

    except Exception as e:
        logging.error(f"Erro ao atualizar status da locação ID {locacao_id}: {e}")
        return False

def formatar_locacoes_json(locacoes):
    """
    Formata a lista de locações em JSON para envio ao frontend.
    """
    return [
        {
            "id": locacao["id"],
            "cliente": locacao["nome_cliente"],
            "endereco": locacao["endereco"],
            "telefone": locacao["telefone"],
            "data_inicio": locacao["data_inicio"],
            "data_fim": locacao["data_fim"],
            "valor_total": locacao["valor_total"],
            "itens": locacao["itens"]
        } for locacao in locacoes
    ]
