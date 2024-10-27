import psycopg2
from database import get_connection, release_connection

class RegistroDanos:
    @staticmethod
    def add_dano(locacao_id, item_id, quantidade_danificada):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada)
                VALUES (%s, %s, %s)
            ''', (locacao_id, item_id, quantidade_danificada))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao registrar dano: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_by_locacao(locacao_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM registro_danos WHERE locacao_id = %s', (locacao_id,))
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar danos por locação: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM registro_danos')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar todos os registros de danos: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)
