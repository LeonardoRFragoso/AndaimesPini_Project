import psycopg2
from database import get_connection, release_connection
from models.itens_locados import ItensLocados
from models.cliente import Cliente
import logging
from datetime import date
from helpers import atualizar_estoque, restaurar_estoque  # Importações para manipulação do estoque

class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status="ativo"):
        """
        Cria uma nova locação no banco de dados com um status inicial.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status))
            locacao_id = cursor.fetchone()[0]
            conn.commit()
            logging.info(f"Locação criada com sucesso: ID {locacao_id}")

            # Atualizar o estoque para cada item locado
            for item in ItensLocados.get_by_locacao(locacao_id):
                item_id = item['item_id']
                quantidade = item['quantidade']
                # Subtrai a quantidade locada do estoque
                estoque_atualizado = atualizar_estoque(item_id, quantidade)
                if estoque_atualizado:
                    logging.info(f"Estoque atualizado para o item ID {item_id}, quantidade retirada: {quantidade}")
                else:
                    logging.error(f"Falha ao atualizar o estoque para o item ID {item_id}")

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

            logging.info("Locações detalhadas obtidas com sucesso.")
            return locacoes_completas
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar locações detalhadas: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_detailed_by_id(locacao_id):
        """
        Retorna os detalhes de uma locação específica pelo ID.
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
                }
                return locacao_detalhada
            else:
                logging.warning(f"Locação ID {locacao_id} não encontrada.")
                return None
        except psycopg2.Error as e:
            logging.error(f"Erro ao buscar detalhes da locação ID {locacao_id}: {e}")
            return None
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
    def extend(locacao_id, dias_adicionais, novo_valor_total, abatimento=0):
        """
        Prorroga a data de término de uma locação específica, atualiza o valor total e registra abatimento.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE locacoes 
                SET data_fim = data_fim + INTERVAL '%s days',
                    valor_total = %s,
                    abatimento = %s
                WHERE id = %s
            ''', (dias_adicionais, novo_valor_total, abatimento, locacao_id))
            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                logging.info(f"Locação ID {locacao_id} prorrogada, valor atualizado para {novo_valor_total}, com abatimento de {abatimento}.")
            else:
                logging.warning(f"Locação ID {locacao_id} não encontrada para prorrogação.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao prorrogar locação e atualizar valor: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def finalizar_antecipadamente(locacao_id, nova_data_fim, novo_valor_final):
        """
        Finaliza a locação antecipadamente, atualizando a data final e o valor total no banco de dados.
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
            if sucesso:
                logging.info(f"Locação ID {locacao_id} finalizada antecipadamente. Nova data final: {nova_data_fim}, Novo valor final: {novo_valor_final}.")
            else:
                logging.warning(f"Locação ID {locacao_id} não encontrada para finalização antecipada.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao finalizar antecipadamente a locação: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def update_status(locacao_id, status):
        """
        Atualiza o status de uma locação específica no banco de dados.
        """
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
                logging.info(f"Status da locação ID {locacao_id} atualizado para {status}.")
            else:
                logging.warning(f"Locação ID {locacao_id} não encontrada para atualização de status.")
            
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao atualizar status da locação: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def atualizar_estoque_devolucao(locacao_id):
        """
        Restaura o estoque dos itens locados de uma locação específica ao confirmar a devolução.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Obtenha todos os itens locados para a locação fornecida
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            itens_ignorados = 0
            itens_atualizados = 0  # Contador para itens processados com sucesso

            for item in itens_locados:
                # Validação completa dos dados de cada item
                item_id = item.get('item_id')
                quantidade = item.get('quantidade')
                data_devolucao = item.get('data_devolucao')

                # Verificar se o item já foi devolvido ou se os dados estão incompletos
                if item_id is None or quantidade is None or data_devolucao is not None:
                    itens_ignorados += 1
                    logging.warning(f"Item com dados incompletos ou já devolvido ao confirmar devolução para locação ID {locacao_id}: {item}")
                    continue

                # Restaurar o estoque para cada item locado
                estoque_restaurado = restaurar_estoque(item_id, quantidade)
                if estoque_restaurado:
                    logging.info(f"Estoque restaurado para o item ID {item_id}, quantidade: {quantidade}")
                else:
                    logging.error(f"Falha ao restaurar o estoque para o item ID {item_id}")

                # Atualizar a data de devolução no item locado
                cursor.execute('''
                    UPDATE itens_locados
                    SET data_devolucao = %s
                    WHERE locacao_id = %s AND item_id = %s
                ''', (date.today(), locacao_id, item_id))
                itens_atualizados += 1

            # Commit das alterações de data_devolucao para os itens
            conn.commit()

            # Log de resumo
            logging.info(f"{itens_atualizados} itens atualizados e estoque restaurado para a locação ID {locacao_id}.")
            if itens_ignorados > 0:
                logging.warning(f"{itens_ignorados} itens com dados incompletos ou já devolvidos foram ignorados ao confirmar devolução para locação ID {locacao_id}.")

            return True
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao restaurar estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)



    @staticmethod
    def atualizar_estoque_reducao(locacao_id):
        """
        Reduz o estoque dos itens locados de uma locação específica ao reativar a locação.
        """
        conn = get_connection()
        cursor = conn.cursor()
        try:
            itens_locados = ItensLocados.get_by_locacao(locacao_id)
            for item in itens_locados:
                item_id = item['item_id']
                quantidade = item['quantidade']
                atualizar_estoque(item_id, quantidade)
                logging.info(f"Estoque atualizado para o item ID {item_id}, quantidade: -{quantidade}")
            return True
        except psycopg2.Error as e:
            conn.rollback()
            logging.error(f"Erro ao reduzir estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
