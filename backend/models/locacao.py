import psycopg2
from database import get_connection, release_connection
from models.itens_locados import ItensLocados
import logging

class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total):
        """
        Cria uma nova locação no banco de dados.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, valor_total)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, valor_total))
            locacao_id = cursor.fetchone()[0]
            conn.commit()
            logging.info(f"Locação criada com sucesso: ID {locacao_id}")
            return locacao_id
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao adicionar locação: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        """
        Retorna todas as locações com os detalhes do cliente e os itens locados.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, clientes.nome, clientes.endereco, clientes.telefone, 
                       locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
            '''
            cursor.execute(query)
            locacoes = cursor.fetchall()

            locacoes_completas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacoes_completas.append({
                    "id": locacao_id,
                    "nome_cliente": locacao[1],
                    "endereco": locacao[2],
                    "telefone": locacao[3],
                    "data_inicio": locacao[4].strftime("%Y-%m-%d"),
                    "data_fim": locacao[5].strftime("%Y-%m-%d"),
                    "valor_total": float(locacao[6]),
                    "itens": itens_locados
                })

            logging.info("Locações obtidas com sucesso.")
            return locacoes_completas
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar locações: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def extend(locacao_id, dias_adicionais):
        """
        Prorroga a data de término de uma locação específica em um determinado número de dias.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes 
                SET data_fim = data_fim + INTERVAL '%s days'
                WHERE id = %s
            ''', (dias_adicionais, locacao_id))
            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                logging.info(f"Locação ID {locacao_id} prorrogada por {dias_adicionais} dias.")
            else:
                logging.warning(f"Locação ID {locacao_id} não encontrada para prorrogação.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao prorrogar locação: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
