import psycopg2
from database import get_connection, release_connection

class Cliente:
    @staticmethod
    def create(nome, endereco, telefone, referencia):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO clientes (nome, endereco, telefone, referencia)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (nome, endereco, telefone, referencia))
            cliente_id = cursor.fetchone()[0]
            conn.commit()
            return cliente_id
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar cliente: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM clientes')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar clientes: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_by_id(cliente_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM clientes WHERE id = %s', (cliente_id,))
            return cursor.fetchone()
        except psycopg2.Error as e:
            print(f"Erro ao buscar cliente por ID: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update(cliente_id, nome, endereco, telefone, referencia):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE clientes SET nome = %s, endereco = %s, telefone = %s, referencia = %s
                WHERE id = %s
            ''', (nome, endereco, telefone, referencia, cliente_id))
            conn.commit()
            return cursor.rowcount > 0
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao atualizar cliente: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def delete(cliente_id):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('DELETE FROM clientes WHERE id = %s', (cliente_id,))
            conn.commit()
            return cursor.rowcount > 0
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao excluir cliente: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
