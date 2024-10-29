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

    @staticmethod
    def get_pedidos(cliente_id):
        """
        Retorna todos os pedidos associados a um cliente específico, incluindo detalhes dos itens locados.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logging.info(f"Buscando pedidos detalhados para o cliente ID {cliente_id}.")
            cursor.execute('''
                SELECT 
                    c.id AS cliente_id,
                    c.nome AS cliente_nome,
                    l.id AS locacao_id,
                    l.data_inicio,
                    l.data_fim,
                    l.valor_total,
                    l.status,
                    i.nome_item,
                    i.tipo_item,
                    il.quantidade AS quantidade_locada
                FROM clientes AS c
                JOIN locacoes AS l ON c.id = l.cliente_id
                LEFT JOIN itens_locados AS il ON l.id = il.locacao_id
                LEFT JOIN inventario AS i ON il.item_id = i.id
                WHERE c.id = %s
            ''', (cliente_id,))
            pedidos = cursor.fetchall()
            pedidos_list = [
                {
                    "cliente_id": pedido[0],
                    "cliente_nome": pedido[1],
                    "locacao_id": pedido[2],
                    "data_inicio": pedido[3],
                    "data_fim": pedido[4],
                    "valor_total": float(pedido[5]),
                    "status": pedido[6],
                    "nome_item": pedido[7],
                    "tipo_item": pedido[8],
                    "quantidade_locada": pedido[9]
                }
                for pedido in pedidos
            ]
            logging.info(f"Pedidos detalhados para o cliente ID {cliente_id}: {pedidos_list}")
            return pedidos_list
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar pedidos do cliente {cliente_id}: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)
