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
        """Cria uma nova locação no banco de dados com um status inicial e define a data_fim_original."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Definindo data_fim_original como data_fim na criação da locação
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, data_fim_original, valor_total, valor_pago_entrega, valor_receber_final, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status))
            locacao_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Locação criada com sucesso: ID {locacao_id}")

            for item in ItensLocados.get_by_locacao(locacao_id):
                item_id = item['item_id']
                quantidade = item['quantidade']
                try:
                    Inventario.atualizar_estoque(item_id, quantidade)
                    logger.info(f"Estoque atualizado para o item ID {item_id}, quantidade retirada: {quantidade}")
                except ValueError as e:
                    logger.error(f"Falha ao atualizar o estoque para o item ID {item_id}: {e}")

            return locacao_id
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao adicionar locação: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all_detailed():
        """Retorna todas as locações com detalhes do cliente e dos itens locados, incluindo o status."""
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

            locacoes_completas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacoes_completas.append({
                    "id": locacao_id,
                    "data_inicio": locacao[1].strftime("%d/%m/%Y"),
                    "data_fim": locacao[2].strftime("%d/%m/%Y"),
                    "valor_total": float(locacao[3]),
                    "valor_pago_entrega": float(locacao[4]) if locacao[4] else 0.0,
                    "valor_receber_final": float(locacao[5]) if locacao[5] else 0.0,
                    "status": locacao[6],
                    "cliente": {
                        "nome": locacao[7],
                        "endereco": locacao[8],
                        "telefone": locacao[9]
                    },
                    "itens": itens_locados
                })

            logger.info("Locações detalhadas obtidas com sucesso.")
            return locacoes_completas
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar locações detalhadas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_detailed_by_id(locacao_id):
        """Retorna os detalhes de uma locação específica pelo ID, incluindo data_fim_original e data_fim atual."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            query = '''
                SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.data_fim_original,
                    locacoes.valor_total, locacoes.valor_pago_entrega, locacoes.valor_receber_final,
                    locacoes.status, clientes.nome, clientes.endereco, clientes.telefone
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
                WHERE locacoes.id = %s
            '''
            cursor.execute(query, (locacao_id,))
            locacao = cursor.fetchone()
            if locacao:
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacao_detalhada = {
                    "id": locacao[0],
                    "data_inicio": locacao[1].strftime("%d/%m/%Y"),
                    "data_fim": locacao[2].strftime("%d/%m/%Y"),
                    "data_fim_original": locacao[3].strftime("%d/%m/%Y") if locacao[3] else None,
                    "valor_total": float(locacao[4]),
                    "valor_pago_entrega": float(locacao[5]) if locacao[5] else 0.0,
                    "valor_receber_final": float(locacao[6]) if locacao[6] else 0.0,
                    "status": locacao[7],
                    "cliente": {
                        "nome": locacao[8],
                        "endereco": locacao[9],
                        "telefone": locacao[10]
                    },
                    "itens": itens_locados
                }
                return locacao_detalhada
            else:
                logger.warning(f"Locação ID {locacao_id} não encontrada.")
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
    def extend(locacao_id, dias_adicionais, novo_valor_total, abatimento=0):
        """Prorroga a data de término de uma locação, atualiza o valor total e registra abatimento."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Atualizando a data_fim e valor_total, preservando data_fim_original se ainda estiver NULL
            cursor.execute('''
                UPDATE locacoes 
                SET data_fim = data_fim + INTERVAL '%s days',
                    valor_total = %s - %s,
                    data_fim_original = COALESCE(data_fim_original, data_fim)
                WHERE id = %s
            ''', (dias_adicionais, novo_valor_total, abatimento, locacao_id))

            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                nova_data_fim = (date.today() + timedelta(days=dias_adicionais)).strftime("%Y-%m-%d")
                logger.info(f"Locação ID {locacao_id} prorrogada com {dias_adicionais} dias adicionais e valor ajustado.")
                return {
                    "sucesso": True,
                    "nova_data_fim": nova_data_fim,
                    "valor_final_ajustado": novo_valor_total - abatimento,
                    "valor_abatimento": abatimento
                }
            else:
                logger.warning(f"Locação ID {locacao_id} não encontrada para prorrogação.")
                return {"sucesso": False}
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao prorrogar locação e atualizar valor: {e}")
            return {"sucesso": False}
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def finalizar_antecipadamente(locacao_id, nova_data_fim, novo_valor_final):
        """
        Finaliza a locação antecipadamente, atualizando a data final e o valor total no banco de dados,
        além de restaurar o estoque dos itens devolvidos.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes
                SET data_fim = %s,
                    valor_total = %s,
                    status = 'concluido'
                WHERE id = %s
            ''', (nova_data_fim, novo_valor_final, locacao_id))
            
            conn.commit()

            sucesso = cursor.rowcount > 0
            if not sucesso:
                logger.warning(f"Locação ID {locacao_id} não encontrada para finalização antecipada.")
                return False

            data_devolucao_efetiva = nova_data_fim
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            for item in itens_locados:
                item_id = item["item_id"]
                quantidade = item["quantidade"]

                if item["data_devolucao"] is None:
                    estoque_restaurado = restaurar_estoque(item_id, quantidade)
                    if estoque_restaurado:
                        logger.info(f"Estoque restaurado para o item ID {item_id}, quantidade: {quantidade}")
                    else:
                        logger.error(f"Falha ao restaurar o estoque para o item ID {item_id}")
                    
                    ItensLocados.mark_as_returned(locacao_id, item_id, data_devolucao=data_devolucao_efetiva)
                else:
                    logger.info(f"Item ID {item_id} já devolvido anteriormente.")

            logger.info(f"Locação ID {locacao_id} finalizada antecipadamente.")
            return {
                "sucesso": True,
                "data_devolucao_efetiva": data_devolucao_efetiva,
                "valor_final_ajustado": novo_valor_final
            }
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
        """Restaura o estoque dos itens locados de uma locação específica ao confirmar a devolução."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            itens_ignorados = 0
            itens_atualizados = 0

            for item in itens_locados:
                item_id = item.get('item_id')
                quantidade = item.get('quantidade')
                data_devolucao = item.get('data_devolucao')

                if item_id is None or quantidade is None or data_devolucao is not None:
                    itens_ignorados += 1
                    logger.warning(f"Item já devolvido ou com dados incompletos ao confirmar devolução para locação ID {locacao_id}: {item}")
                    continue

                estoque_restaurado = restaurar_estoque(item_id, quantidade)
                if estoque_restaurado:
                    logger.info(f"Estoque restaurado para o item ID {item_id}, quantidade: {quantidade}")
                else:
                    logger.error(f"Falha ao restaurar o estoque para o item ID {item_id}")

                cursor.execute('''
                    UPDATE itens_locados
                    SET data_devolucao = %s
                    WHERE locacao_id = %s AND item_id = %s
                ''', (date.today(), locacao_id, item_id))
                itens_atualizados += 1

            conn.commit()
            logger.info(f"{itens_atualizados} itens atualizados e estoque restaurado para a locação ID {locacao_id}.")
            if itens_ignorados > 0:
                logger.warning(f"{itens_ignorados} itens já devolvidos ou com dados incompletos foram ignorados ao confirmar devolução para locação ID {locacao_id}.")

            return True
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao restaurar estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
