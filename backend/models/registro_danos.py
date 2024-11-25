import psycopg2
from database import get_connection, release_connection
import logging
from datetime import date

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RegistroDanos:
    @staticmethod
    def adicionar_dano(locacao_id, item_id, quantidade_danificada, descricao_problema=None):
        """
        Registra um dano em um item locado, associando uma descrição opcional do problema.
        
        Parâmetros:
            locacao_id (int): ID da locação associada ao dano.
            item_id (int): ID do item danificado no inventário.
            quantidade_danificada (int): Quantidade do item que sofreu dano.
            descricao_problema (str, optional): Descrição detalhada do problema. Padrão é None.
        
        Retorna:
            int: ID do registro de dano criado ou None em caso de falha.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada, descricao_problema, data_registro)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (locacao_id, item_id, quantidade_danificada, descricao_problema, date.today()))
                    dano_id = cursor.fetchone()[0]
                    logger.info(f"Dano registrado com sucesso: ID {dano_id} para locação ID {locacao_id}, item ID {item_id}.")
                    return dano_id
        except psycopg2.Error as e:
            logger.error(f"Erro ao registrar dano: {e}")
            return None
        finally:
            release_connection(conn)
    
    @staticmethod
    def adicionar_problema(locacao_id, item_id, descricao_problema):
        """
        Registra um problema específico em um item locado com uma descrição detalhada.
        A quantidade_danificada é definida como 0, indicando que não houve dano físico, apenas um problema reportado.
        
        Parâmetros:
            locacao_id (int): ID da locação associada ao problema.
            item_id (int): ID do item no inventário.
            descricao_problema (str): Descrição detalhada do problema ocorrido.
        
        Retorna:
            int: ID do registro de problema criado ou None em caso de falha.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada, descricao_problema, data_registro)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (locacao_id, item_id, 0, descricao_problema, date.today()))
                    problema_id = cursor.fetchone()[0]
                    logger.info(f"Problema registrado com sucesso: ID {problema_id} para locação ID {locacao_id}, item ID {item_id}.")
                    return problema_id
        except psycopg2.Error as e:
            logger.error(f"Erro ao registrar problema: {e}")
            return None
        finally:
            release_connection(conn)
    
    @staticmethod
    def obter_por_locacao(locacao_id):
        """
        Retorna todos os registros de danos associados a uma locação específica.
        
        Parâmetros:
            locacao_id (int): ID da locação para a qual os danos serão buscados.
        
        Retorna:
            list: Lista de dicionários com detalhes dos registros de danos ou problemas.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        SELECT rd.id, rd.item_id, rd.quantidade_danificada, rd.descricao_problema, rd.data_registro
                        FROM registro_danos rd
                        WHERE rd.locacao_id = %s
                        ORDER BY rd.data_registro DESC
                    ''', (locacao_id,))
                    registros = cursor.fetchall()
                    registros_danos = [
                        {
                            "id": registro[0],
                            "item_id": registro[1],
                            "quantidade_danificada": registro[2],
                            "descricao_problema": registro[3],
                            "data_registro": registro[4].strftime("%Y-%m-%d")
                        }
                        for registro in registros
                    ]
                    logger.info(f"{len(registros_danos)} registros de danos/problemas obtidos para locação ID {locacao_id}.")
                    return registros_danos
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar danos por locação: {e}")
            return []
        finally:
            release_connection(conn)
    
    @staticmethod
    def obter_todos_registros():
        """
        Retorna todos os registros de danos e problemas presentes no banco de dados.
        
        Retorna:
            list: Lista de dicionários com detalhes de todos os registros de danos e problemas.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        SELECT rd.id, rd.locacao_id, rd.item_id, rd.quantidade_danificada, rd.descricao_problema, rd.data_registro
                        FROM registro_danos rd
                        ORDER BY rd.data_registro DESC
                    ''')
                    registros = cursor.fetchall()
                    todos_registros = [
                        {
                            "id": registro[0],
                            "locacao_id": registro[1],
                            "item_id": registro[2],
                            "quantidade_danificada": registro[3],
                            "descricao_problema": registro[4],
                            "data_registro": registro[5].strftime("%Y-%m-%d")
                        }
                        for registro in registros
                    ]
                    logger.info(f"Todos os registros de danos/problemas obtidos com sucesso. Total: {len(todos_registros)}")
                    return todos_registros
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar todos os registros de danos: {e}")
            return []
        finally:
            release_connection(conn)
