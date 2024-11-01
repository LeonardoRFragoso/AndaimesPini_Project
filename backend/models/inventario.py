import psycopg2
from database import get_connection, release_connection
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Inventario:
    @staticmethod
    def create(nome_item, quantidade, tipo_item):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO inventario (nome_item, quantidade, tipo_item)
                VALUES (%s, %s, %s)
                RETURNING id
            ''', (nome_item, quantidade, tipo_item))
            item_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Item '{nome_item}' adicionado ao inventário com quantidade {quantidade} e tipo '{tipo_item}'.")
            return item_id
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao adicionar item ao inventário: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT id, nome_item, quantidade, tipo_item FROM inventario')
            inventario = cursor.fetchall()
            logger.info("Itens do inventário listados com sucesso.")
            return [{"id": item[0], "nome_item": item[1], "quantidade": item[2], "tipo_item": item[3]} for item in inventario]
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar inventário: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_available():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logger.info("Executando Inventario.get_available")  # Log para monitorar chamadas
            cursor.execute('SELECT id, nome_item, quantidade, tipo_item FROM inventario WHERE quantidade > 0')
            inventario_disponivel = cursor.fetchall()
            logger.info(f"Itens disponíveis no inventário listados com sucesso. Total de itens disponíveis: {len(inventario_disponivel)}")
            return [{"id": item[0], "nome_item": item[1], "quantidade": item[2], "tipo_item": item[3]} for item in inventario_disponivel]
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar inventário disponível: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update_quantidade(item_id, nova_quantidade):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE inventario SET quantidade = %s WHERE id = %s
            ''', (nova_quantidade, item_id))
            conn.commit()
            logger.info(f"Quantidade do item ID {item_id} atualizada para {nova_quantidade}.")
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao atualizar quantidade do item no inventário: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_item_id_by_modelo(modelo_item):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logger.info(f"Buscando ID do item com modelo '{modelo_item}'.")
            cursor.execute('SELECT id FROM inventario WHERE nome_item = %s', (modelo_item,))
            item_id = cursor.fetchone()
            if item_id:
                logger.info(f"ID do item encontrado: {item_id[0]}")
            else:
                logger.warning(f"Item com modelo '{modelo_item}' não encontrado.")
            return item_id[0] if item_id else None
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar item por modelo: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def delete_item(item_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('DELETE FROM inventario WHERE id = %s', (item_id,))
            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                logger.info(f"Item ID {item_id} excluído com sucesso.")
            else:
                logger.warning(f"Item ID {item_id} não encontrado para exclusão.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao excluir item do inventário: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
