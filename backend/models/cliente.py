import sqlite3
from database import get_connection, release_connection
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Cliente:
    @staticmethod
    def get_all():
        """
        Retorna todos os clientes do banco de dados.

        Retorna:
            list: Lista de dicionários contendo os detalhes dos clientes.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info("Executando consulta para buscar todos os clientes.")
            cursor.execute("""
                SELECT id, nome, endereco, telefone, referencia
                FROM clientes
                ORDER BY nome
            """)
            clientes = cursor.fetchall()
            if not clientes:
                logger.info("Nenhum cliente encontrado no banco de dados.")
                return []
            return [
                {
                    "id": cliente[0],
                    "nome": cliente[1],
                    "endereco": cliente[2],
                    "telefone": cliente[3],
                    "referencia": cliente[4],
                }
                for cliente in clientes
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar clientes no banco de dados: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def criar_cliente(nome, endereco="", telefone=None, referencia=""):
        """
        Cria um novo cliente no banco de dados.

        Parâmetros:
            nome (str): Nome do cliente.
            endereco (str): Endereço do cliente.
            telefone (str): Telefone do cliente.
            referencia (str): Referência adicional.

        Retorna:
            int: ID do cliente criado ou None em caso de erro.
        """
        if not nome or not telefone:
            logger.warning("Nome e telefone são obrigatórios para criar um cliente.")
            return None

        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO clientes (nome, endereco, telefone, referencia)
                VALUES (?, ?, ?, ?)
                RETURNING id
            """, (nome, endereco, telefone, referencia))
            conn.commit()
            cliente_id = cursor.fetchone()[0]
            logger.info(f"Cliente criado com sucesso: ID {cliente_id}")
            return cliente_id
        except Exception as e:
            logger.error(f"Erro ao criar cliente: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def get_cliente_por_dados(nome, endereco, telefone):
        """
        Busca um cliente no banco de dados com base no nome, endereço e telefone.

        Parâmetros:
            nome (str): Nome do cliente.
            endereco (str): Endereço do cliente.
            telefone (str): Telefone do cliente.

        Retorna:
            dict: Dicionário com os detalhes do cliente ou None se não encontrado.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info("Buscando cliente por nome, endereço e telefone.")
            cursor.execute("""
                SELECT id, nome, endereco, telefone, referencia
                FROM clientes
                WHERE nome = ? AND endereco = ? AND telefone = ?
            """, (nome, endereco, telefone))
            cliente = cursor.fetchone()
            if cliente:
                logger.info(f"Cliente encontrado: Nome {nome}, Endereço {endereco}, Telefone {telefone}")
                return {
                    "id": cliente[0],
                    "nome": cliente[1],
                    "endereco": cliente[2],
                    "telefone": cliente[3],
                    "referencia": cliente[4],
                }
            logger.warning("Cliente não encontrado.")
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar cliente por dados: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def obter_cliente_por_id(cliente_id):
        """
        Retorna os detalhes de um cliente específico pelo ID.

        Parâmetros:
            cliente_id (int): ID do cliente.

        Retorna:
            dict: Dicionário contendo os detalhes do cliente ou None se não encontrado.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, nome, endereco, telefone, referencia
                FROM clientes
                WHERE id = ?
            """, (cliente_id,))
            cliente = cursor.fetchone()
            if cliente:
                logger.info(f"Cliente encontrado: ID {cliente_id}")
                return {
                    "id": cliente[0],
                    "nome": cliente[1],
                    "endereco": cliente[2],
                    "telefone": cliente[3],
                    "referencia": cliente[4],
                }
            logger.warning(f"Cliente ID {cliente_id} não encontrado.")
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar cliente por ID: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def atualizar_cliente(cliente_id, nome=None, endereco=None, telefone=None, referencia=None):
        """
        Atualiza os dados de um cliente específico.

        Parâmetros:
            cliente_id (int): ID do cliente.
            nome (str): Nome atualizado.
            endereco (str): Endereço atualizado.
            telefone (str): Telefone atualizado.
            referencia (str): Referência atualizada.

        Retorna:
            bool: True se atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE clientes
                SET nome = COALESCE(?, nome),
                    endereco = COALESCE(?, endereco),
                    telefone = COALESCE(?, telefone),
                    referencia = COALESCE(?, referencia)
                WHERE id = ?
            """, (nome, endereco, telefone, referencia, cliente_id))
            conn.commit()
            atualizado = cursor.rowcount > 0
            if atualizado:
                logger.info(f"Cliente ID {cliente_id} atualizado com sucesso.")
            else:
                logger.warning(f"Cliente ID {cliente_id} não encontrado para atualização.")
            return atualizado
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def excluir_cliente(cliente_id):
        """
        Exclui um cliente do banco de dados.

        Parâmetros:
            cliente_id (int): ID do cliente.

        Retorna:
            bool: True se excluído com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM clientes WHERE id = ?", (cliente_id,))
            conn.commit()
            excluido = cursor.rowcount > 0
            if excluido:
                logger.info(f"Cliente ID {cliente_id} excluído com sucesso.")
            else:
                logger.warning(f"Cliente ID {cliente_id} não encontrado para exclusão.")
            return excluido
        except Exception as e:
            logger.error(f"Erro ao excluir cliente: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def obter_pedidos_por_cliente(cliente_id):
        """
        Retorna todos os pedidos associados a um cliente específico.

        Parâmetros:
            cliente_id (int): ID do cliente.

        Retorna:
            list: Lista de dicionários contendo os detalhes dos pedidos.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    l.id AS locacao_id,
                    l.data_inicio,
                    l.data_fim,
                    l.valor_total,
                    l.status,
                    i.nome_item,
                    i.tipo_item,
                    il.quantidade AS quantidade_locada
                FROM locacoes AS l
                JOIN itens_locados AS il ON l.id = il.locacao_id
                JOIN inventario AS i ON il.item_id = i.id
                WHERE l.cliente_id = ?
            """, (cliente_id,))
            pedidos = cursor.fetchall()
            if not pedidos:
                logger.info(f"Nenhum pedido encontrado para o cliente ID {cliente_id}.")
                return []
            def format_date(date_value):
                """Helper function to safely format date values"""
                if not date_value:
                    return None
                if isinstance(date_value, str):
                    try:
                        # Try to parse the string as datetime
                        parsed_date = datetime.fromisoformat(date_value.replace('Z', '+00:00'))
                        return parsed_date.strftime("%Y-%m-%d")
                    except (ValueError, AttributeError):
                        # If parsing fails, return the string as is
                        return date_value
                elif hasattr(date_value, 'strftime'):
                    # If it's already a datetime object
                    return date_value.strftime("%Y-%m-%d")
                else:
                    # Return as string if it's neither
                    return str(date_value)

            return [
                {
                    "id": pedido[0],  # Changed from locacao_id to id for frontend compatibility
                    "data_inicio": format_date(pedido[1]),
                    "data_fim": format_date(pedido[2]),
                    "valor_total": float(pedido[3]) if pedido[3] else 0.0,
                    "status": pedido[4],
                    "nome_item": pedido[5],
                    "tipo_item": pedido[6],
                    "quantidade_locada": pedido[7],
                }
                for pedido in pedidos
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar pedidos do cliente {cliente_id}: {e}")
            return []
        finally:
            release_connection(conn)
