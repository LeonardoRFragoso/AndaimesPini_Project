import sqlite3
from database import get_connection, release_connection
from models.inventario import Inventario
from datetime import date, datetime
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ItensLocados:
    @staticmethod
    def adicionar_item(locacao_id, item_id, quantidade):
        """
        Adiciona um item à locação especificada com a quantidade fornecida 
        e define data_alocacao como a data atual.

        Parâmetros:
            locacao_id (int): ID da locação.
            item_id (int): ID do item no inventário.
            quantidade (int): Quantidade do item a ser adicionada.

        Retorna:
            bool: True se a operação foi bem-sucedida, False caso contrário.
        """
        if quantidade <= 0:
            logger.error("A quantidade a ser adicionada deve ser positiva.")
            return False

        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    # Verificar se o item existe e está disponível no inventário
                    inventario_item = Inventario.get_item_by_id(item_id)
                    if not inventario_item:
                        logger.error(f"Item ID {item_id} não encontrado no inventário.")
                        return False
                    if quantidade > inventario_item['quantidade_disponivel']:
                        logger.error(f"Quantidade solicitada ({quantidade}) excede o estoque disponível ({inventario_item['quantidade_disponivel']}).")
                        return False

                    # Inserir o item na tabela itens_locados
                    cursor.execute('''
                        INSERT INTO itens_locados (locacao_id, item_id, quantidade, data_alocacao)
                        VALUES (?, ?, ?, ?)
                    ''', (locacao_id, item_id, quantidade, date.today()))
                    logger.info(f"Item ID {item_id} adicionado à locação ID {locacao_id} com quantidade {quantidade} em {date.today()}.")

                    # Atualizar o estoque no inventário
                    sucesso_estoque = Inventario.atualizar_estoque(item_id, -quantidade)
                    if not sucesso_estoque:
                        logger.error(f"Erro ao atualizar estoque para o item ID {item_id}.")
                        raise Exception(f"Erro ao atualizar estoque para o item ID {item_id}.")

            return True
        except Exception as e:
            logger.error(f"Erro ao adicionar item locado: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def marcar_como_devolvido(locacao_id, item_id=None, data_devolucao=None):
        """
        Marca um ou todos os itens de uma locação como devolvidos.

        Parâmetros:
            locacao_id (int): ID da locação.
            item_id (int, optional): ID específico do item a ser devolvido. Se None, todos os itens serão marcados.
            data_devolucao (str, optional): Data da devolução no formato 'YYYY-MM-DD'. Se None, a data atual será usada.

        Retorna:
            bool: True se a operação foi bem-sucedida, False caso contrário.
        """
        data_devolucao_dt = datetime.strptime(data_devolucao, '%Y-%m-%d').date() if data_devolucao else date.today()

        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    if item_id:
                        # Atualizar apenas um item específico
                        cursor.execute('''
                            UPDATE itens_locados
                            SET data_devolucao = ?
                            WHERE locacao_id = ? AND item_id = ? AND data_devolucao IS NULL
                        ''', (data_devolucao_dt, locacao_id, item_id))
                        if cursor.rowcount == 0:
                            logger.warning(f"Item ID {item_id} na locação ID {locacao_id} já está devolvido ou não existe.")
                            return False
                        logger.info(f"Item ID {item_id} marcado como devolvido na locação ID {locacao_id} em {data_devolucao_dt}.")
                    else:
                        # Atualizar todos os itens da locação
                        cursor.execute('''
                            UPDATE itens_locados
                            SET data_devolucao = ?
                            WHERE locacao_id = ? AND data_devolucao IS NULL
                        ''', (data_devolucao_dt, locacao_id))
                        if cursor.rowcount == 0:
                            logger.warning(f"Todos os itens na locação ID {locacao_id} já estão devolvidos ou não existem.")
                            return False
                        logger.info(f"Todos os itens da locação ID {locacao_id} marcados como devolvidos em {data_devolucao_dt}.")
            return True
        except Exception as e:
            logger.error(f"Erro ao marcar itens como devolvidos: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def obter_por_locacao(locacao_id):
        """
        Retorna todos os itens associados a uma locação específica com detalhes completos, incluindo o status.

        Parâmetros:
            locacao_id (int): ID da locação.

        Retorna:
            list: Lista de dicionários com detalhes dos itens locados.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        SELECT 
                            il.item_id, 
                            inv.nome_item, 
                            il.quantidade, 
                            il.data_alocacao, 
                            il.data_devolucao, 
                            inv.tipo_item,
                            loc.data_fim
                        FROM itens_locados il
                        JOIN inventario inv ON il.item_id = inv.id
                        JOIN locacoes loc ON il.locacao_id = loc.id
                        WHERE il.locacao_id = ?
                    ''', (locacao_id,))
                    items = cursor.fetchall()
                    logger.info(f"Itens obtidos para locação ID {locacao_id}.")

                    today = date.today()
                    items_list = []
                    for row in items:
                        item_id, nome_item, quantidade, data_alocacao, data_devolucao, tipo_item, data_fim = row
                        if data_devolucao is not None:
                            status = 'devolvido'
                        else:
                            if data_fim < today:
                                status = 'atrasado'
                            else:
                                status = 'aguardando devolução'

                        items_list.append({
                            "item_id": item_id,
                            "nome_item": nome_item,
                            "quantidade": quantidade,
                            "data_alocacao": data_alocacao.strftime("%Y-%m-%d") if data_alocacao else None,
                            "data_devolucao": data_devolucao.strftime("%Y-%m-%d") if data_devolucao else None,
                            "tipo_item": tipo_item,
                            "status": status
                        })
            return items_list
        except Exception as e:
            logger.error(f"Erro ao buscar itens locados: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def registrar_problema(locacao_id, item_id, descricao_problema):
        """
        Registra um problema para um item específico de uma locação.

        Parâmetros:
            locacao_id (int): ID da locação.
            item_id (int): ID do item no inventário.
            descricao_problema (str): Descrição do problema ocorrido.

        Retorna:
            bool: True se a operação foi bem-sucedida, False caso contrário.
        """
        if not descricao_problema:
            logger.error("Descrição do problema é obrigatória.")
            return False

        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        INSERT INTO registro_danos (locacao_id, item_id, descricao_problema, data_registro)
                        VALUES (?, ?, ?, ?)
                    ''', (locacao_id, item_id, descricao_problema, date.today()))
                    logger.info(f"Problema registrado para item ID {item_id} na locação ID {locacao_id}.")
            return True
        except Exception as e:
            logger.error(f"Erro ao registrar problema para item: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def prorrogar_locacao(locacao_id, dias_adicionais):
        """
        Prorroga a data de alocação dos itens locados de uma locação em um número específico de dias.

        Parâmetros:
            locacao_id (int): ID da locação.
            dias_adicionais (int): Número de dias a serem adicionados à locação.

        Retorna:
            bool: True se a operação foi bem-sucedida, False caso contrário.
        """
        if dias_adicionais <= 0:
            logger.error("O número de dias adicionais deve ser positivo.")
            return False

        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    # Atualiza a data_fim na tabela locacoes
                    cursor.execute('''
                        UPDATE locacoes
                        SET data_fim = date(data_fim, '+' || ? || ' days')
                        WHERE id = ?
                    ''', (dias_adicionais, locacao_id))
                    if cursor.rowcount == 0:
                        logger.warning(f"Locação ID {locacao_id} não encontrada para prorrogação.")
                        return False
                    logger.info(f"Data de fim da locação ID {locacao_id} prorrogada em {dias_adicionais} dias.")

            return True
        except Exception as e:
            logger.error(f"Erro ao prorrogar locação ID {locacao_id}: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def atualizar_data_alocacao_null():
        """
        Define a data_alocacao para registros onde está NULL como a data atual.

        Retorna:
            int: Número de registros atualizados.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        UPDATE itens_locados
                        SET data_alocacao = ?
                        WHERE data_alocacao IS NULL
                    ''', (date.today(),))
                    registros_atualizados = cursor.rowcount
            logger.info(f"data_alocacao atualizada para {registros_atualizados} registros com valor NULL.")
            return registros_atualizados
        except Exception as e:
            logger.error(f"Erro ao atualizar data_alocacao para registros NULL: {e}")
            return 0
        finally:
            release_connection(conn)
