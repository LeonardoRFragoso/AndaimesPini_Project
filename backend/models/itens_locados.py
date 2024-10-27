import psycopg2
from database import get_connection, release_connection

class ItensLocados:
    @staticmethod
    def add_item(locacao_id, item_id, quantidade):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO itens_locados (locacao_id, item_id, quantidade)
                VALUES (%s, %s, %s)
            ''', (locacao_id, item_id, quantidade))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar item locado: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def return_item(locacao_id, item_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                DELETE FROM itens_locados WHERE locacao_id = %s AND item_id = %s
            ''', (locacao_id, item_id))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao remover item locado: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_by_locacao(locacao_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT inventario.nome_item, itens_locados.quantidade
                FROM itens_locados
                JOIN inventario ON itens_locados.item_id = inventario.id
                WHERE itens_locados.locacao_id = %s
            '''
            cursor.execute(query, (locacao_id,))
            return [{"nome_item": row[0], "quantidade": row[1]} for row in cursor.fetchall()]
        except psycopg2.Error as e:
            print(f"Erro ao buscar itens locados: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)
