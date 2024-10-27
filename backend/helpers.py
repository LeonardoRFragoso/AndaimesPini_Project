from database import get_connection, release_connection
import psycopg2
from flask import jsonify

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
        print(f"Erro ao atualizar o estoque: {e}")
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
        print(f"Erro ao restaurar o estoque: {e}")
        return jsonify({"error": "Erro ao restaurar o estoque"}), 500
    finally:
        cursor.close()
        release_connection(conn)
    return jsonify({"message": "Estoque restaurado com sucesso"}), 200

def handle_database_error(error):
    """
    Tratamento centralizado de erros de banco de dados.
    """
    print(f"Erro no banco de dados: {error}")
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
        print(f"Erro ao buscar registro no banco de dados: {e}")
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
        print(f"Erro ao excluir registro do banco de dados: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)
