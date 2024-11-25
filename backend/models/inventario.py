import psycopg2
from database import get_connection, release_connection
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Inventario:
    @staticmethod
    def create(nome_item, quantidade, tipo_item):
        """
        Cria um novo item no inventário.

        Parâmetros:
            nome_item (str): Nome do item.
            quantidade (int): Quantidade inicial do item.
            tipo_item (str): Tipo ou categoria do item.

        Retorna:
            int: ID do item criado ou None em caso de erro.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO inventario (nome_item, quantidade, quantidade_disponivel, tipo_item)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (nome_item, quantidade, quantidade, tipo_item))
                    item_id = cursor.fetchone()[0]
                    logger.info(f"Item '{nome_item}' adicionado ao inventário com ID {item_id}.")
                    return item_id
        except psycopg2.Error as e:
            logger.error(f"Erro ao adicionar item ao inventário: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def get_all(only_available=False):
        """
        Obtém todos os itens do inventário.

        Parâmetros:
            only_available (bool): Se True, retorna apenas itens com quantidade_disponível > 0.

        Retorna:
            list: Lista de dicionários contendo os itens do inventário.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    if only_available:
                        query = """
                            SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item
                            FROM inventario
                            WHERE quantidade_disponivel > 0
                        """
                        logger.info("Buscando itens disponíveis no inventário.")
                    else:
                        query = """
                            SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item
                            FROM inventario
                        """
                        logger.info("Buscando todos os itens no inventário.")

                    cursor.execute(query)
                    items = cursor.fetchall()
                    return [
                        {
                            "id": item[0],
                            "nome_item": item[1],
                            "quantidade": item[2],
                            "quantidade_disponivel": item[3],
                            "tipo_item": item[4],
                            "status": Inventario._get_status(item[2], item[3]),
                        }
                        for item in items
                    ]
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar itens do inventário: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def _get_status(total, available):
        """
        Determina o status de um item no inventário.

        Parâmetros:
            total (int): Quantidade total do item.
            available (int): Quantidade disponível do item.

        Retorna:
            str: Status do item ("disponível", "indisponível", "parcialmente disponível").
        """
        if available == 0:
            return "indisponível"
        elif available == total:
            return "disponível"
        return "parcialmente disponível"

    @staticmethod
    def get_item_by_modelo(modelo):
        """
        Busca um item no inventário com base no modelo.

        Parâmetros:
            modelo (str): Modelo do item a ser buscado.

        Retorna:
            dict: Detalhes do item encontrado ou None se não encontrado.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    logger.info(f"Buscando item no inventário pelo modelo: {modelo}")
                    cursor.execute("""
                        SELECT id, nome_item, quantidade_disponivel, tipo_item
                        FROM inventario
                        WHERE nome_item = %s
                    """, (modelo,))
                    item = cursor.fetchone()
                    if item:
                        logger.info(f"Item encontrado no inventário: {modelo}")
                        return {
                            "id": item[0],
                            "nome_item": item[1],
                            "quantidade_disponivel": item[2],
                            "tipo_item": item[3],
                        }
                    logger.warning(f"Item com modelo '{modelo}' não encontrado no inventário.")
                    return None
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar item no inventário: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def update_stock(item_id, quantity_change, operation="decrease"):
        """
        Atualiza o estoque de um item, reduzindo ou aumentando a quantidade disponível.

        Parâmetros:
            item_id (int): ID do item.
            quantity_change (int): Quantidade a ser alterada.
            operation (str): "decrease" para reduzir ou "increase" para aumentar.

        Retorna:
            bool: True se o estoque foi atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT quantidade_disponivel, quantidade FROM inventario WHERE id = %s FOR UPDATE
                    """, (item_id,))
                    item = cursor.fetchone()

                    if not item:
                        logger.warning(f"Item ID {item_id} não encontrado.")
                        return False

                    current_available, total_quantity = item
                    if operation == "decrease":
                        if current_available < quantity_change:
                            logger.warning(f"Estoque insuficiente para item ID {item_id}. Disponível: {current_available}, Solicitado: {quantity_change}")
                            return False
                        new_quantity = current_available - quantity_change
                    elif operation == "increase":
                        if current_available + quantity_change > total_quantity:
                            logger.warning(f"Quantidade excede o total permitido para item ID {item_id}.")
                            return False
                        new_quantity = current_available + quantity_change
                    else:
                        logger.error("Operação inválida. Use 'decrease' ou 'increase'.")
                        return False

                    cursor.execute("""
                        UPDATE inventario
                        SET quantidade_disponivel = %s
                        WHERE id = %s
                    """, (new_quantity, item_id))
                    conn.commit()
                    logger.info(f"Estoque do item ID {item_id} atualizado com sucesso. Nova quantidade disponível: {new_quantity}")
                    return True
        except psycopg2.Error as e:
            logger.error(f"Erro ao atualizar estoque do item ID {item_id}: {e}")
            return False
        finally:
            release_connection(conn)
