import psycopg2
from database import get_connection, release_connection
import logging

class Cliente:
    @staticmethod
    def create(nome, endereco, telefone, referencia):
        """
        Cria um novo cliente no banco de dados e retorna o ID do cliente criado.
        """
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
            logging.info(f"Cliente criado com sucesso: ID {cliente_id}")
            return cliente_id
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao adicionar cliente: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        """
        Retorna todos os clientes do banco de dados em formato de lista de dicionários.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logging.info("Executando consulta para buscar todos os clientes.")
            cursor.execute('SELECT id, nome, endereco, telefone, referencia FROM clientes')
            clientes = cursor.fetchall()
            logging.info(f"Clientes retornados da consulta: {clientes}")
            # Converte para lista de dicionários
            clientes_list = [
                {
                    "id": cliente[0],
                    "nome": cliente[1],
                    "endereco": cliente[2],
                    "telefone": cliente[3],
                    "referencia": cliente[4]
                }
                for cliente in clientes
            ]
            logging.info(f"Lista formatada de clientes: {clientes_list}")
            return clientes_list
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar clientes no banco de dados: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)
            logging.info("Conexão com o banco de dados encerrada.")

    @staticmethod
    def get_by_id(cliente_id):
        """
        Retorna um cliente específico com base no ID.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT id, nome, endereco, telefone, referencia FROM clientes WHERE id = %s', (cliente_id,))
            cliente = cursor.fetchone()
            # Verifica se cliente existe e retorna como dicionário
            if cliente:
                return {
                    "id": cliente[0],
                    "nome": cliente[1],
                    "endereco": cliente[2],
                    "telefone": cliente[3],
                    "referencia": cliente[4]
                }
            else:
                return None
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar cliente por ID: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update(cliente_id, nome, endereco, telefone, referencia):
        """
        Atualiza as informações de um cliente existente.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE clientes SET nome = %s, endereco = %s, telefone = %s, referencia = %s
                WHERE id = %s
            ''', (nome, endereco, telefone, referencia, cliente_id))
            conn.commit()
            updated = cursor.rowcount > 0  # Retorna True se o cliente foi atualizado
            if updated:
                logging.info(f"Cliente ID {cliente_id} atualizado com sucesso.")
            else:
                logging.warning(f"Cliente ID {cliente_id} não encontrado para atualização.")
            return updated
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao atualizar cliente: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def delete(cliente_id):
        """
        Exclui um cliente específico com base no ID.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('DELETE FROM clientes WHERE id = %s', (cliente_id,))
            conn.commit()
            deleted = cursor.rowcount > 0  # Retorna True se o cliente foi excluído
            if deleted:
                logging.info(f"Cliente ID {cliente_id} excluído com sucesso.")
            else:
                logging.warning(f"Cliente ID {cliente_id} não encontrado para exclusão.")
            return deleted
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao excluir cliente: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
