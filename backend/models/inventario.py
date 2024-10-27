import psycopg2
from database import get_connection, release_connection

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
            return item_id
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar item ao inventário: {e}")
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
            return [{"id": item[0], "nome_item": item[1], "quantidade": item[2], "tipo_item": item[3]} for item in inventario]
        except psycopg2.Error as e:
            print(f"Erro ao buscar inventário: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_available():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT id, nome_item, quantidade, tipo_item FROM inventario WHERE quantidade > 0')
            inventario_disponivel = cursor.fetchall()
            return [{"id": item[0], "nome_item": item[1], "quantidade": item[2], "tipo_item": item[3]} for item in inventario_disponivel]
        except psycopg2.Error as e:
            print(f"Erro ao buscar inventário disponível: {e}")
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
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao atualizar quantidade do item no inventário: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_item_id_by_modelo(modelo_item):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT id FROM inventario WHERE nome_item = %s', (modelo_item,))
            item_id = cursor.fetchone()
            return item_id[0] if item_id else None
        except psycopg2.Error as e:
            print(f"Erro ao buscar item por modelo: {e}")
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
            return cursor.rowcount > 0
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao excluir item do inventário: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
