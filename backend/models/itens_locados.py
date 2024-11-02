import psycopg2
from database import get_connection, release_connection
import logging
from datetime import date

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ItensLocados:
    @staticmethod
    def add_item(locacao_id, item_id, quantidade):
        """
        Adiciona um item à locação especificada com a quantidade fornecida e define data_alocacao como a data atual.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO itens_locados (locacao_id, item_id, quantidade, data_alocacao)
                VALUES (%s, %s, %s, %s)
            ''', (locacao_id, item_id, quantidade, date.today()))
            conn.commit()
            logger.info(f"Item ID {item_id} adicionado à locação ID {locacao_id} com data de alocação {date.today()}.")
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao adicionar item locado: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def mark_as_returned(locacao_id, item_id=None, data_devolucao=None):
        """
        Marca um ou todos os itens de uma locação como devolvidos.
        - Se item_id for None, marca todos os itens da locação como devolvidos.
        - Se data_devolucao for None, usa a data atual.
        """
        conn = get_connection()
        cursor = conn.cursor()
        data_devolucao = data_devolucao or date.today()  # Define data_devolucao como a data atual se não for fornecida
        try:
            if item_id:
                cursor.execute('''
                    UPDATE itens_locados
                    SET data_devolucao = %s
                    WHERE locacao_id = %s AND item_id = %s AND data_devolucao IS NULL
                ''', (data_devolucao, locacao_id, item_id))
                logger.info(f"Item ID {item_id} marcado como devolvido na locação ID {locacao_id}. Data de devolução: {data_devolucao}.")
            else:
                cursor.execute('''
                    UPDATE itens_locados
                    SET data_devolucao = %s
                    WHERE locacao_id = %s AND data_devolucao IS NULL
                ''', (data_devolucao, locacao_id))
                logger.info(f"Todos os itens da locação ID {locacao_id} foram marcados como devolvidos. Data de devolução: {data_devolucao}.")
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao marcar itens como devolvidos: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_by_locacao(locacao_id):
        """
        Retorna todos os itens associados a uma locação específica com detalhes completos.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT itens_locados.item_id, inventario.nome_item, itens_locados.quantidade, 
                       itens_locados.data_alocacao, itens_locados.data_devolucao, inventario.tipo_item
                FROM itens_locados
                JOIN inventario ON itens_locados.item_id = inventario.id
                WHERE itens_locados.locacao_id = %s
            '''
            cursor.execute(query, (locacao_id,))
            items = cursor.fetchall()
            logger.info(f"Itens obtidos para locação ID {locacao_id}.")
            return [
                {
                    "item_id": row[0],
                    "nome_item": row[1],
                    "quantidade": row[2],
                    "data_alocacao": row[3],
                    "data_devolucao": row[4],
                    "tipo_item": row[5]
                }
                for row in items
            ]
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar itens locados: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def register_problem(locacao_id, item_id, descricao_problema):
        """
        Registra um problema para um item específico de uma locação.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO registro_danos (locacao_id, item_id, descricao_problema, data_registro)
                VALUES (%s, %s, %s, %s)
            ''', (locacao_id, item_id, descricao_problema, date.today()))
            conn.commit()
            logger.info(f"Problema registrado para item ID {item_id} na locação ID {locacao_id}.")
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao registrar problema para item: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def extend_rental(locacao_id, dias_adicionais):
        """
        Prorroga a data de alocação dos itens locados de uma locação em um número específico de dias.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE itens_locados
                SET data_alocacao = data_alocacao + INTERVAL '%s days'
                WHERE locacao_id = %s AND data_devolucao IS NULL
            ''', (dias_adicionais, locacao_id))
            conn.commit()
            logger.info(f"Data de alocação prorrogada em {dias_adicionais} dias para itens da locação ID {locacao_id}.")
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao prorrogar data de alocação dos itens: {e}")
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update_null_data_alocacao():
        """
        Define a data_alocacao para registros onde está NULL como a data atual.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE itens_locados
                SET data_alocacao = %s
                WHERE data_alocacao IS NULL
            ''', (date.today(),))
            conn.commit()
            logger.info("data_alocacao atualizada para registros com valor NULL.")
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao atualizar data_alocacao para registros NULL: {e}")
        finally:
            cursor.close()
            release_connection(conn)
