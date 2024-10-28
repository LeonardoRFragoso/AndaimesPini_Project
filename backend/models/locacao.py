import psycopg2
from database import get_connection, release_connection
from models.itens_locados import ItensLocados
from models.cliente import Cliente
import logging
from datetime import date

class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total, status="ativo"):
        """
        Cria uma nova locação no banco de dados com um status inicial.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, valor_total, status)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, valor_total, status))
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
    def get_all_detailed():
        """
        Retorna todas as locações com detalhes do cliente e dos itens locados, incluindo o status.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total,
                       locacoes.status, clientes.nome, clientes.endereco, clientes.telefone
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
            '''
            cursor.execute(query)
            locacoes = cursor.fetchall()

            locacoes_completas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)  # Busca itens locados para esta locação
                locacoes_completas.append({
                    "id": locacao_id,
                    "data_inicio": locacao[1].strftime("%d/%m/%Y"),
                    "data_fim": locacao[2].strftime("%d/%m/%Y"),
                    "valor_total": float(locacao[3]),
                    "status": locacao[4],  # Inclui o status da locação
                    "cliente": {
                        "nome": locacao[5],
                        "endereco": locacao[6],
                        "telefone": locacao[7]
                    },
                    "itens": itens_locados  # Lista de itens locados com descrição e quantidade
                })

            logging.info("Locações detalhadas obtidas com sucesso.")
            return locacoes_completas
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar locações detalhadas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_active_locacoes():
        """
        Retorna todas as locações que ainda estão em vigor (data_fim >= data atual) e estão ativas.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, clientes.nome, clientes.endereco, clientes.telefone, 
                       locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total, locacoes.status
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
                WHERE locacoes.data_fim >= %s AND locacoes.status = 'ativo'
            '''
            cursor.execute(query, (date.today(),))
            locacoes = cursor.fetchall()

            locacoes_ativas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacoes_ativas.append({
                    "id": locacao_id,
                    "nome_cliente": locacao[1],
                    "endereco": locacao[2],
                    "telefone": locacao[3],
                    "data_inicio": locacao[4].strftime("%Y-%m-%d"),
                    "data_fim": locacao[5].strftime("%Y-%m-%d"),
                    "valor_total": float(locacao[6]),
                    "status": locacao[7],
                    "itens": itens_locados
                })

            logging.info("Locações ativas obtidas com sucesso.")
            return locacoes_ativas
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar locações ativas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_locacoes_sem_devolucao():
        """
        Retorna todas as locações que já passaram da data de término, não possuem devolução registrada e estão pendentes.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, clientes.nome, clientes.endereco, clientes.telefone, 
                       locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total, locacoes.status
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
                WHERE locacoes.data_fim < %s AND locacoes.status = 'pendente'
            '''
            cursor.execute(query, (date.today(),))
            locacoes = cursor.fetchall()

            locacoes_com_alertas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacoes_com_alertas.append({
                    "id": locacao_id,
                    "nome_cliente": locacao[1],
                    "endereco": locacao[2],
                    "telefone": locacao[3],
                    "data_inicio": locacao[4].strftime("%Y-%m-%d"),
                    "data_fim": locacao[5].strftime("%Y-%m-%d"),
                    "valor_total": float(locacao[6]),
                    "status": locacao[7],
                    "itens": itens_locados
                })

            logging.info("Locações com alertas obtidas com sucesso.")
            return locacoes_com_alertas
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar locações com alertas: {e}")
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
