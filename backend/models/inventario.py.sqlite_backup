import sqlite3
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
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO inventario (nome_item, quantidade, quantidade_disponivel, tipo_item)
                VALUES (?, ?, ?, ?)
                RETURNING id
            """, (nome_item, quantidade, quantidade, tipo_item))
            conn.commit()
            item_id = cursor.fetchone()[0]
            logger.info(f"Item '{nome_item}' adicionado ao inventário com ID {item_id}.")
            return item_id
        except Exception as e:
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
            cursor = conn.cursor()
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
        except Exception as e:
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
            cursor = conn.cursor()
            logger.info(f"Buscando item no inventário pelo modelo: {modelo}")
            cursor.execute("""
                SELECT id, nome_item, quantidade_disponivel, tipo_item
                FROM inventario
                WHERE nome_item = ?
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
        except Exception as e:
            logger.error(f"Erro ao buscar item no inventário: {e}")
            return None
        finally:
            release_connection(conn)
            
    @staticmethod
    def get_item_id_by_modelo(modelo):
        """
        Busca o ID de um item no inventário com base no modelo.

        Parâmetros:
            modelo (str): Modelo do item a ser buscado.

        Retorna:
            int: ID do item encontrado ou None se não encontrado.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info(f"Buscando ID do item no inventário pelo modelo: {modelo}")
            cursor.execute("""
                SELECT id FROM inventario WHERE nome_item = ?
            """, (modelo,))
            item = cursor.fetchone()
            if item:
                logger.info(f"ID do item encontrado no inventário: {modelo}")
                return item[0]
            logger.warning(f"Item com modelo '{modelo}' não encontrado no inventário.")
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar item no inventário: {e}")
            return None
        finally:
            release_connection(conn)
            
    @staticmethod
    def get_by_id(item_id):
        """
        Busca um item no inventário com base no ID.

        Parâmetros:
            item_id (int): ID do item a ser buscado.

        Retorna:
            dict: Detalhes do item encontrado ou None se não encontrado.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info(f"Buscando item no inventário pelo ID: {item_id}")
            cursor.execute("""
                SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item
                FROM inventario
                WHERE id = ?
            """, (item_id,))
            item = cursor.fetchone()
            if item:
                logger.info(f"Item encontrado no inventário: ID {item_id}")
                return {
                    "id": item[0],
                    "nome_item": item[1],
                    "quantidade": item[2],
                    "quantidade_disponivel": item[3],
                    "tipo_item": item[4],
                    "status": Inventario._get_status(item[2], item[3]),
                }
            logger.warning(f"Item com ID {item_id} não encontrado no inventário.")
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar item no inventário: {e}")
            return None
        finally:
            release_connection(conn)
            
    @staticmethod
    def update_quantidade(item_id, nova_quantidade):
        """
        Atualiza a quantidade total de um item no inventário.

        Parâmetros:
            item_id (int): ID do item.
            nova_quantidade (int): Nova quantidade total do item.

        Retorna:
            bool: True se atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            # Primeiro, obter a quantidade atual e disponível
            cursor.execute("""
                SELECT quantidade, quantidade_disponivel FROM inventario WHERE id = ?
            """, (item_id,))
            item = cursor.fetchone()
            
            if not item:
                logger.warning(f"Item ID {item_id} não encontrado.")
                return False
                
            quantidade_atual, quantidade_disponivel = item
            
            # Calcular a diferença entre a quantidade atual e a nova
            diferenca = nova_quantidade - quantidade_atual
            
            # Atualizar a quantidade total e a quantidade disponível
            nova_quantidade_disponivel = max(0, quantidade_disponivel + diferenca)
            
            cursor.execute("""
                UPDATE inventario
                SET quantidade = ?,
                    quantidade_disponivel = ?
                WHERE id = ?
            """, (nova_quantidade, nova_quantidade_disponivel, item_id))
            conn.commit()
            
            logger.info(f"Quantidade do item ID {item_id} atualizada para {nova_quantidade}.")
            return True
        except Exception as e:
            logger.error(f"Erro ao atualizar quantidade do item ID {item_id}: {e}")
            return False
        finally:
            release_connection(conn)
            
    @staticmethod
    def delete_item(item_id):
        """
        Exclui um item do inventário.

        Parâmetros:
            item_id (int): ID do item a ser excluído.

        Retorna:
            bool: True se excluído com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM inventario WHERE id = ?", (item_id,))
            conn.commit()
            excluido = cursor.rowcount > 0
            if excluido:
                logger.info(f"Item ID {item_id} excluído com sucesso.")
            else:
                logger.warning(f"Item ID {item_id} não encontrado para exclusão.")
            return excluido
        except Exception as e:
            logger.error(f"Erro ao excluir item ID {item_id}: {e}")
            return False
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
            cursor = conn.cursor()
            cursor.execute("""
                SELECT quantidade_disponivel, quantidade FROM inventario WHERE id = ?
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
                SET quantidade_disponivel = ?
                WHERE id = ?
            """, (new_quantity, item_id))
            conn.commit()
            logger.info(f"Estoque do item ID {item_id} atualizado com sucesso. Nova quantidade disponível: {new_quantity}")
            return True
        except Exception as e:
            logger.error(f"Erro ao atualizar estoque do item ID {item_id}: {e}")
            return False
        finally:
            release_connection(conn)
