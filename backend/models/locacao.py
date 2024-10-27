import psycopg2
from database import get_connection, release_connection
from models.itens_locados import ItensLocados

class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total):
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
            return locacao_id
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar locação: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, clientes.nome, clientes.endereco, clientes.telefone, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total
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
                    "numero_nota": locacao_id,
                    "nome_cliente": locacao[1],
                    "endereco": locacao[2],
                    "telefone": locacao[3],
                    "data_inicio": locacao[4],
                    "data_fim": locacao[5],
                    "valor_total": locacao[6],
                    "itens": itens_locados
                })

            return locacoes_completas
        except psycopg2.Error as e:
            print(f"Erro ao buscar locações: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def extend(locacao_id, dias_adicionais):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes SET data_fim = data_fim + interval '%s days' WHERE id = %s
            ''', (dias_adicionais, locacao_id))
            conn.commit()
            return cursor.rowcount > 0
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao prorrogar locação: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
