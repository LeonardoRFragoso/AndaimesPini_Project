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
        logger.info(f"[ANTES] Estoque do item ID {item_id}: {quantidade_atual} unidades disponíveis.")

        # Verificação se a quantidade desejada está disponível
        if quantidade_atual < quantidade_retirada:
            logger.error(f"Quantidade insuficiente no estoque para o item ID {item_id}. Necessário: {quantidade_retirada}, Disponível: {quantidade_atual}")
            raise ValueError("Estoque insuficiente")

        # Atualiza a quantidade disponível
        cursor.execute('''
            UPDATE inventario 
            SET quantidade_disponivel = quantidade_disponivel - %s 
            WHERE id = %s
        ''', (quantidade_retirada, item_id))
        
        conn.commit()
        logger.info(f"[DEPOIS] Estoque do item ID {item_id} atualizado, quantidade retirada: {quantidade_retirada}")
        return True
    except (psycopg2.Error, ValueError) as e:
        conn.rollback()
        logger.error(f"Erro ao atualizar o estoque do item ID {item_id}: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)


def restaurar_estoque(item_id, quantidade):
    """
    Restaura a quantidade disponível de um item no estoque, evitando duplicações.
    Esta função deve ser chamada apenas uma vez por item para evitar incrementos repetidos.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Verifica se o estoque já está restaurado
        cursor.execute('''
            SELECT quantidade_disponivel FROM inventario 
            WHERE id = %s AND quantidade_disponivel >= quantidade
        ''', (item_id,))
        
        # Se o estoque já está restaurado, não incrementa novamente
        if cursor.fetchone() is not None:
            logger.warning(f"Item ID {item_id} já está com estoque restaurado. Ação ignorada.")
            return False  # Evita restauração duplicada

        # Obter a quantidade disponível antes da atualização para log
        cursor.execute('SELECT quantidade_disponivel FROM inventario WHERE id = %s', (item_id,))
        quantidade_atual = cursor.fetchone()

        if quantidade_atual is None:
            logger.error(f"Item ID {item_id} não encontrado.")
            return False

        quantidade_atual = quantidade_atual[0]
        logger.info(f"[ANTES] Estoque do item ID {item_id}: {quantidade_atual} unidades disponíveis antes de restauração.")

        # Realiza a restauração do estoque
        cursor.execute('''
            UPDATE inventario 
            SET quantidade_disponivel = quantidade_disponivel + %s 
            WHERE id = %s
        ''', (quantidade, item_id))
        
        conn.commit()
        logger.info(f"[DEPOIS] Estoque do item ID {item_id} restaurado, quantidade adicionada: {quantidade}. Estoque atualizado para {quantidade_atual + quantidade}.")
        return True
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Erro ao restaurar o estoque para o item ID {item_id}: {e}")
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

def validate_table_name(table_name):
    """Valida o nome da tabela para prevenir injeção de SQL."""
    valid_tables = ['inventario', 'locacoes', 'clientes', 'itens_locados', 'registro_danos']  # Exemplo de tabelas permitidas
    if table_name in valid_tables:
        return table_name
    else:
        raise ValueError(f"Nome de tabela inválido: {table_name}")

def get_record_by_id(table, record_id):
    """
    Função auxiliar para buscar um registro específico em uma tabela pelo ID.
    """
    try:
        table = validate_table_name(table)  # Validação de nome de tabela
    except ValueError as e:
        logger.error(e)
        return None

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f'SELECT * FROM {table} WHERE id = %s', (record_id,))
        record = cursor.fetchone()
        logger.info(f"Registro encontrado na tabela {table} para ID {record_id}: {record}")
        return record
    except psycopg2.Error as e:
        logger.error(f"Erro ao buscar registro no banco de dados: {e}")
        return None
    finally:
        cursor.close()
        release_connection(conn)

def delete_record(table, record_id):
    """
    Função auxiliar para excluir um registro em uma tabela pelo ID.
    """
    try:
        table = validate_table_name(table)  # Validação de nome de tabela
    except ValueError as e:
        logger.error(e)
        return False

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(f'DELETE FROM {table} WHERE id = %s', (record_id,))
        conn.commit()
        sucesso = cursor.rowcount > 0
        if sucesso:
            logger.info(f"Registro ID {record_id} excluído da tabela {table}.")
        else:
            logger.warning(f"Registro ID {record_id} não encontrado para exclusão na tabela {table}.")
        return sucesso
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Erro ao excluir registro do banco de dados: {e}")
        return False
    finally:
        cursor.close()
        release_connection(conn)
