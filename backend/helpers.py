from database import get_connection, release_connection
import psycopg2
from flask import jsonify
import logging

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def atualizar_estoque(item_id, quantidade_retirada):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Log da quantidade disponível antes da atualização
        cursor.execute('SELECT quantidade_disponivel FROM inventario WHERE id = %s', (item_id,))
        quantidade_atual = cursor.fetchone()
        
        if quantidade_atual is None:
            logger.error(f"Item ID {item_id} não encontrado.")
            return False

        quantidade_atual = quantidade_atual[0]
        logger.info(f"Quantidade atual antes da atualização para o item ID {item_id}: {quantidade_atual}")

        # Atualiza a quantidade disponível, garantindo que a coluna correta seja utilizada
        cursor.execute('''
            UPDATE inventario 
            SET quantidade_disponivel = quantidade_disponivel - %s 
            WHERE id = %s AND quantidade_disponivel >= %s
        ''', (quantidade_retirada, item_id, quantidade_retirada))
        
        if cursor.rowcount == 0:
            raise ValueError("Quantidade insuficiente no estoque para o item solicitado.")
        
        conn.commit()
        logger.info(f"Estoque atualizado para o item ID {item_id}, quantidade retirada: {quantidade_retirada}")
        return True
    except (psycopg2.Error, ValueError) as e:
        conn.rollback()
        logger.error(f"Erro ao atualizar o estoque: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)


def restaurar_estoque(item_id, quantidade):
    """
    Restaura a quantidade disponível de um item no estoque, adicionando a quantidade especificada.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Atualiza a quantidade disponível do item no estoque, aumentando a quantidade
        cursor.execute('''
            UPDATE inventario 
            SET quantidade_disponivel = quantidade_disponivel + %s 
            WHERE id = %s
        ''', (quantidade, item_id))
        
        # Confirma a transação
        conn.commit()
        logger.info(f"Estoque restaurado para o item ID {item_id}, quantidade adicionada: {quantidade}")
        return True
    except psycopg2.Error as e:
        # Rollback em caso de erro e log
        conn.rollback()
        logger.error(f"Erro ao restaurar o estoque: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)

def handle_database_error(error):
    """
    Tratamento centralizado de erros de banco de dados.
    """
    logger.error(f"Erro no banco de dados: {error}")
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
        logger.error(f"Erro ao buscar registro no banco de dados: {e}")
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
        logger.info(f"Registro ID {record_id} deletado da tabela {table}.")
        return True
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Erro ao excluir registro do banco de dados: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)
