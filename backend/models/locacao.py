import psycopg2
from database import get_connection, release_connection
from models.itens_locados import ItensLocados
from models.cliente import Cliente
from models.inventario import Inventario
import logging
from datetime import date, timedelta
from helpers import atualizar_estoque, restaurar_estoque

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status="ativo"):
        """
        Cria uma nova locação no banco de dados, inicializando com status "ativo".
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, data_fim_original, valor_total, valor_pago_entrega, valor_receber_final, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status))
            locacao_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Locação criada com sucesso: ID {locacao_id}")
            return locacao_id
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao criar locação: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all_detailed():
        """
        Obtém todas as locações com detalhes completos, incluindo informações do cliente.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total,
                       locacoes.valor_pago_entrega, locacoes.valor_receber_final, locacoes.status,
                       clientes.nome, clientes.endereco, clientes.telefone
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
            '''
            cursor.execute(query)
            locacoes = cursor.fetchall()

            if not locacoes:
                logger.info("Nenhuma locação encontrada.")
                return []

            resultado = []
            for locacao in locacoes:
                resultado.append({
                    "id": locacao[0],
                    "data_inicio": locacao[1].strftime("%Y-%m-%d"),
                    "data_fim": locacao[2].strftime("%Y-%m-%d"),
                    "valor_total": float(locacao[3]) if locacao[3] else 0.0,
                    "valor_pago_entrega": float(locacao[4]) if locacao[4] else 0.0,
                    "valor_receber_final": float(locacao[5]) if locacao[5] else 0.0,
                    "status": locacao[6],
                    "cliente": {
                        "nome": locacao[7],
                        "endereco": locacao[8],
                        "telefone": locacao[9]
                    }
                })

            logger.info(f"{len(resultado)} locações processadas com sucesso.")
            return resultado
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar locações detalhadas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def confirmar_devolucao(locacao_id):
        """
        Confirma a devolução de uma locação, restaurando o estoque e atualizando o status.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                SELECT id, status
                FROM locacoes
                WHERE id = %s
            ''', (locacao_id,))
            locacao = cursor.fetchone()

            if not locacao:
                logger.warning(f"Locação ID {locacao_id} não encontrada.")
                return {"sucesso": False, "mensagem": "Locação não encontrada"}

            if locacao[1] == "concluido":
                logger.info(f"Locação ID {locacao_id} já concluída.")
                return {"sucesso": False, "mensagem": "Locação já concluída"}

            # Atualiza status e registra data de devolução
            cursor.execute('''
                UPDATE locacoes
                SET status = 'concluido', data_devolucao_efetiva = %s
                WHERE id = %s
            ''', (datetime.now(), locacao_id))
            conn.commit()

            # Restaura estoque
            sucesso_estoque = Locacao.atualizar_estoque_devolucao(locacao_id)
            if not sucesso_estoque:
                logger.error(f"Erro ao restaurar estoque para locação ID {locacao_id}.")
                return {"sucesso": False, "mensagem": "Erro ao atualizar estoque"}

            logger.info(f"Devolução confirmada para locação ID {locacao_id}.")
            return {"sucesso": True, "mensagem": "Devolução confirmada"}
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao confirmar devolução para locação ID {locacao_id}: {e}")
            return {"sucesso": False, "mensagem": "Erro ao confirmar devolução"}
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_detailed_by_id(locacao_id):
        """Obtém os detalhes completos de uma locação específica, incluindo valores financeiros ajustados."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.data_fim_original,
                    locacoes.valor_total, locacoes.valor_pago_entrega, locacoes.valor_receber_final,
                    locacoes.novo_valor_total, locacoes.data_devolucao_efetiva, locacoes.motivo_ajuste_valor,
                    locacoes.status, clientes.nome, clientes.endereco, clientes.telefone, locacoes.abatimento,
                    locacoes.data_prorrogacao
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
                WHERE locacoes.id = %s
            '''
            cursor.execute(query, (locacao_id,))
            locacao = cursor.fetchone()
            
            if locacao:
                # Obtendo os itens locados associados a esta locação
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                
                # Calculando o valor final ajustado
                novo_valor_total = float(locacao[7]) if locacao[7] else float(locacao[4])
                abatimento = float(locacao[14]) if locacao[14] else 0.0
                valor_final_ajustado = novo_valor_total - abatimento
                
                valor_total = float(locacao[4]) if locacao[4] else 0.0
                valor_pago_entrega = float(locacao[5]) if locacao[5] else 0.0
                valor_receber_final = valor_total - valor_pago_entrega

                motivo_ajuste_valor = locacao[9] if locacao[9] else ""
                data_devolucao_efetiva = locacao[8].strftime("%d/%m/%Y") if locacao[8] else None
                data_prorrogacao = locacao[15].strftime("%d/%m/%Y") if locacao[15] else None

                # Calculando dias de atraso e penalidade
                data_fim = locacao[2]
                today = date.today()
                if data_fim < today:
                    dias_atraso = (today - data_fim).days
                else:
                    dias_atraso = 0

                penalidade_por_dia = 50.0  # Ajuste conforme necessário
                penalidade = dias_atraso * penalidade_por_dia if dias_atraso > 0 else 0.0

                # Calculando valor pago e valor a pagar
                valor_pago = valor_pago_entrega  # Considerando que o valor pago até o momento é o valor pago na entrega
                valor_a_pagar = valor_final_ajustado - valor_pago + penalidade

                # Construindo o dicionário de resposta com todos os campos financeiros e detalhes
                return {
                    "id": locacao[0],
                    "data_inicio": locacao[1].strftime("%d/%m/%Y"),
                    "data_fim": locacao[2].strftime("%d/%m/%Y"),
                    "data_fim_original": locacao[3].strftime("%d/%m/%Y") if locacao[3] else None,
                    "valor_total": valor_total,
                    "valor_pago_entrega": valor_pago_entrega,
                    "valor_receber_final": valor_receber_final,
                    "novo_valor_total": novo_valor_total,
                    "valor_final_ajustado": valor_final_ajustado,
                    "data_devolucao_efetiva": data_devolucao_efetiva,
                    "motivo_ajuste_valor": motivo_ajuste_valor,
                    "status": locacao[10],
                    "cliente": {
                        "nome": locacao[11],
                        "endereco": locacao[12],
                        "telefone": locacao[13]
                    },
                    "abatimento": abatimento,
                    "data_prorrogacao": data_prorrogacao,
                    "dias_atraso": dias_atraso,
                    "penalidade": penalidade,
                    "valor_pago": valor_pago,
                    "valor_a_pagar": valor_a_pagar,
                    "itens": itens_locados
                }
            else:
                return None
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar detalhes da locação ID {locacao_id}: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)


    @staticmethod
    def get_active_locacoes():
        """Retorna todas as locações que ainda estão em vigor (data_fim >= data atual) e estão ativas."""
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

            logger.info("Locações ativas obtidas com sucesso.")
            return locacoes_ativas
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar locações ativas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_locacoes_sem_devolucao():
        """Retorna todas as locações que já passaram da data de término e estão pendentes."""
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

            logger.info("Locações com alertas obtidas com sucesso.")
            return locacoes_com_alertas
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar locações com alertas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def extend(locacao_id, dias_adicionais, novo_valor_total, abatimento=0, motivo_ajuste_valor=None):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logger.info(f"Tentando prorrogar locação ID {locacao_id} com {dias_adicionais} dias adicionais, novo valor total: {novo_valor_total}, abatimento: {abatimento}, motivo: {motivo_ajuste_valor}")

            cursor.execute('''
                UPDATE locacoes 
                SET data_fim = data_fim + %s * INTERVAL '1 day',
                    novo_valor_total = %s,
                    abatimento = %s,
                    data_prorrogacao = %s,
                    motivo_ajuste_valor = %s
                WHERE id = %s
            ''', (dias_adicionais, novo_valor_total, abatimento, date.today(), motivo_ajuste_valor, locacao_id))

            conn.commit()
            sucesso = cursor.rowcount > 0

            if sucesso:
                valor_receber_final = novo_valor_total - abatimento
                cursor.execute('''
                    UPDATE locacoes
                    SET valor_receber_final = %s
                    WHERE id = %s
                ''', (valor_receber_final, locacao_id))
                conn.commit()
                return {
                    "sucesso": True,
                    "nova_data_fim": (date.today() + timedelta(days=dias_adicionais)).strftime("%Y-%m-%d"),
                    "valor_final_ajustado": valor_receber_final,
                    "valor_abatimento": abatimento
                }
            else:
                return {"sucesso": False, "mensagem": "Locação não encontrada"}
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao prorrogar a locação ID {locacao_id}: {e}")
            return {"sucesso": False, "mensagem": "Erro ao prorrogar locação"}
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def finalizar_antecipadamente(locacao_id, nova_data_fim, novo_valor_final, motivo_ajuste_valor=None):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes
                SET data_fim = %s,
                    novo_valor_total = %s,
                    status = 'concluido',
                    data_devolucao_efetiva = %s,
                    motivo_ajuste_valor = %s
                WHERE id = %s
            ''', (nova_data_fim, novo_valor_final, date.today(), motivo_ajuste_valor, locacao_id))

            conn.commit()
            sucesso = cursor.rowcount > 0

            if sucesso:
                # Atualiza o valor a receber final após a finalização antecipada
                valor_receber_final = novo_valor_final

                cursor.execute('''
                    UPDATE locacoes
                    SET valor_receber_final = %s
                    WHERE id = %s
                ''', (valor_receber_final, locacao_id))

                conn.commit()
                return {
                    "sucesso": True,
                    "data_devolucao_efetiva": date.today().strftime("%Y-%m-%d"),
                    "valor_final_ajustado": valor_receber_final
                }
            else:
                return {"sucesso": False}
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao finalizar antecipadamente a locação ID {locacao_id}: {e}")
            return {"sucesso": False}
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update_status(locacao_id, status):
        """Atualiza o status de uma locação específica no banco de dados."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes
                SET status = %s
                WHERE id = %s
            ''', (status, locacao_id))
            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                logger.info(f"Status da locação ID {locacao_id} atualizado para {status}.")
            else:
                logger.warning(f"Locação ID {locacao_id} não encontrada para atualização de status.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao atualizar status da locação: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def atualizar_estoque_devolucao(locacao_id):
        """
        Restaura o estoque dos itens locados de uma locação ao confirmar devolução.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            if not itens_locados:
                logger.warning(f"Nenhum item encontrado para locação ID {locacao_id}.")
                return False

            for item in itens_locados:
                item_id = item.get('item_id')
                quantidade = item.get('quantidade')

                if not item_id or not quantidade:
                    logger.warning(f"Dados incompletos para item: {item}")
                    continue

                # Atualiza o estoque
                estoque_restaurado = restaurar_estoque(item_id, quantidade)
                if not estoque_restaurado:
                    logger.error(f"Falha ao restaurar estoque para item ID {item_id}.")
                    return False

                # Atualiza data de devolução nos itens locados
                cursor.execute('''
                    UPDATE itens_locados
                    SET data_devolucao = %s
                    WHERE locacao_id = %s AND item_id = %s
                ''', (datetime.now(), locacao_id, item_id))

            conn.commit()
            logger.info(f"Estoque restaurado para itens da locação ID {locacao_id}.")
            return True
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao restaurar estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)