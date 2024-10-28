import psycopg2
from database import get_connection, release_connection
import logging
from datetime import date

class RegistroDanos:
    @staticmethod
    def add_dano(locacao_id, item_id, quantidade_danificada, descricao_problema=None):
        """
        Registra um dano em um item locado, associando uma descrição opcional do problema.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada, descricao_problema, data_registro)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            ''', (locacao_id, item_id, quantidade_danificada, descricao_problema, date.today()))
            dano_id = cursor.fetchone()[0]
            conn.commit()
            logging.info(f"Dano registrado com sucesso para locação ID {locacao_id}, item ID {item_id}.")
            return dano_id
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao registrar dano: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def add_problem(locacao_id, item_id, descricao_problema):
        """
        Registra um problema específico em um item locado com uma descrição detalhada.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada, descricao_problema, data_registro)
                VALUES (%s, %s, 0, %s, %s)
                RETURNING id
            ''', (locacao_id, item_id, descricao_problema, date.today()))
            problema_id = cursor.fetchone()[0]
            conn.commit()
            logging.info(f"Problema registrado com sucesso para locação ID {locacao_id}, item ID {item_id}.")
            return problema_id
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao registrar problema: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_by_locacao(locacao_id):
        """
        Retorna todos os registros de danos associados a uma locação específica.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT * FROM registro_danos 
                WHERE locacao_id = %s
            ''', (locacao_id,))
            registros_danos = cursor.fetchall()
            logging.info(f"Registros de danos obtidos para locação ID {locacao_id}.")
            return registros_danos
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar danos por locação: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        """
        Retorna todos os registros de danos.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT * FROM registro_danos')
            registros_danos = cursor.fetchall()
            logging.info("Todos os registros de danos obtidos com sucesso.")
            return registros_danos
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar todos os registros de danos: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)
