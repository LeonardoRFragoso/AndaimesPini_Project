import sqlite3
from database import get_connection, release_connection
from models.itens_locados import ItensLocados
from models.cliente import Cliente
from models.inventario import Inventario
import logging
from datetime import datetime, date
from helpers import atualizar_estoque

# Configuração de logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Locacao:
    @staticmethod
    def validar_dados_locacao(data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final):
        """
        Valida os dados de entrada para criação de uma locação.
        
        Parâmetros:
            data_inicio (str): Data de início da locação no formato 'YYYY-MM-DD'.
            data_fim (str): Data de término da locação no formato 'YYYY-MM-DD'.
            valor_total (float): Valor total da locação.
            valor_pago_entrega (float): Valor pago no momento da entrega.
            valor_receber_final (float): Valor a ser pago ao final da locação.
        
        Levanta:
            ValueError: Se qualquer um dos dados fornecidos for inválido.
        """
        try:
            inicio = datetime.strptime(data_inicio, '%Y-%m-%d').date()
            fim = datetime.strptime(data_fim, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError("As datas devem estar no formato 'YYYY-MM-DD'.")

        if inicio >= fim:
            raise ValueError("A data de início deve ser anterior à data de fim.")
        if valor_total < 0 or valor_pago_entrega < 0 or valor_receber_final < 0:
            raise ValueError("Os valores financeiros não podem ser negativos.")
        if valor_pago_entrega > valor_total:
            raise ValueError("O valor pago na entrega não pode exceder o valor total.")
        logger.debug("Validação de dados de locação bem-sucedida.")

    @staticmethod
    def criar_locacao(nome_cliente, endereco_cliente, telefone_cliente, data_inicio, data_fim,
                      valor_total, valor_pago_entrega, valor_receber_final, numero_nota,
                      status="ativo", itens=None):
        """
        Cria uma nova locação no banco de dados.
        
        Parâmetros:
            nome_cliente (str): Nome do cliente.
            endereco_cliente (str): Endereço do cliente.
            telefone_cliente (str): Telefone do cliente.
            data_inicio (str): Data de início da locação.
            data_fim (str): Data de término da locação.
            valor_total (float): Valor total da locação.
            valor_pago_entrega (float): Valor pago no momento da entrega.
            valor_receber_final (float): Valor final a ser pago.
            numero_nota (str): Número da nota fiscal da locação.
            status (str): Status da locação, padrão é "ativo".
            itens (list): Lista de itens a serem locados.

        Retorna:
            int: ID da locação criada no banco de dados, ou None em caso de erro.
        """
        logger.debug("Iniciando o processo de criação de locação.")
        if not all([data_inicio, data_fim]):
            logger.error("Data de início e data de fim são obrigatórias.")
            return None

        try:
            Locacao.validar_dados_locacao(data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final)
        except ValueError as ve:
            logger.error(f"Validação de dados falhou: {ve}")
            return None

        conn = get_connection()
        try:
            cursor = conn.cursor()
            # Criar ou buscar cliente
            cliente = Cliente.get_cliente_por_dados(nome=nome_cliente, endereco=endereco_cliente, telefone=telefone_cliente)
            if not cliente:
                cliente_id = Cliente.criar_cliente(nome_cliente, endereco_cliente, telefone_cliente, referencia=None)
                if not cliente_id:
                    logger.error("Erro ao criar cliente para a locação.")
                    return None
            else:
                cliente_id = cliente['id']

            # Criar a locação
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status, numero_nota)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status, numero_nota))
            conn.commit()
            locacao_id = cursor.fetchone()[0]
            logger.info(f"Locação criada com sucesso: ID {locacao_id}")

            # Adicionar itens à locação
            if itens:
                for item in itens:
                    modelo = item.get('modelo')
                    quantidade = item.get('quantidade')
                    unidade = item.get('unidade', 'peças')

                    if not modelo or not quantidade:
                        logger.error("Itens devem conter 'modelo' e 'quantidade'.")
                        raise ValueError("Erro nos dados do item.")

                    inventario_item = Inventario.get_item_by_modelo(modelo)
                    if not inventario_item:
                        logger.error(f"Item '{modelo}' não encontrado no inventário.")
                        raise ValueError(f"Item '{modelo}' não disponível.")

                    item_id = inventario_item['id']
                    quantidade_disponivel = inventario_item['quantidade_disponivel']

                    if quantidade > quantidade_disponivel:
                        logger.error(f"Quantidade solicitada ({quantidade}) excede o disponível ({quantidade_disponivel}) para o item '{modelo}'.")
                        raise ValueError(f"Estoque insuficiente para o item '{modelo}'.")

                    cursor.execute('''
                        INSERT INTO itens_locados (locacao_id, item_id, quantidade, unidade)
                        VALUES (?, ?, ?, ?)
                    ''', (locacao_id, item_id, quantidade, unidade))
                    conn.commit()
                    logger.debug(f"Item adicionado à locação: {modelo} (Qtd: {quantidade})")

                    # Atualizar estoque
                    atualizar_estoque(item_id, -quantidade)  # Chamada ajustada para aceitar dois argumentos

            logger.info(f"Locação registrada com sucesso: ID {locacao_id}")
            return locacao_id
        except (sqlite3.Error, ValueError) as e:
            logger.error(f"Erro ao criar locação: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def obter_todas_detalhadas():
        """
        Obtém todas as locações com detalhes completos, incluindo informações do cliente e itens locados.

        Retorna:
            list: Lista de dicionários com detalhes das locações, ou uma lista vazia se não houver locações.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total,
                       locacoes.valor_pago_entrega, locacoes.valor_receber_final, locacoes.status,
                       clientes.nome, clientes.endereco, clientes.telefone
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
            ''')
            locacoes = cursor.fetchall()

            if not locacoes:
                logger.info("Nenhuma locação encontrada.")
                return []

            resultado = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.obter_por_locacao(locacao_id)

                # Converter strings de data para objetos datetime se necessário
                data_inicio = locacao[1]
                data_fim = locacao[2]
                
                # Verificar se as datas são strings e convertê-las para o formato correto
                if isinstance(data_inicio, str):
                    data_inicio_str = data_inicio
                else:
                    data_inicio_str = data_inicio.strftime("%Y-%m-%d") if data_inicio else None
                    
                if isinstance(data_fim, str):
                    data_fim_str = data_fim
                else:
                    data_fim_str = data_fim.strftime("%Y-%m-%d") if data_fim else None
                
                # Tratar valores financeiros para evitar erros de conversão
                valor_total = 0.0
                valor_pago_entrega = 0.0
                valor_receber_final = 0.0
                
                if locacao[3] is not None:
                    try:
                        valor_total = float(locacao[3])
                    except (ValueError, TypeError):
                        valor_total = 0.0
                        
                if locacao[4] is not None:
                    try:
                        valor_pago_entrega = float(locacao[4])
                    except (ValueError, TypeError):
                        valor_pago_entrega = 0.0
                        
                if locacao[5] is not None:
                    try:
                        valor_receber_final = float(locacao[5])
                    except (ValueError, TypeError):
                        valor_receber_final = valor_total - valor_pago_entrega
                else:
                    valor_receber_final = valor_total - valor_pago_entrega
                
                resultado.append({
                    "id": locacao_id,
                    "data_inicio": data_inicio_str,
                    "data_fim": data_fim_str,
                    "valor_total": valor_total,
                    "valor_pago_entrega": valor_pago_entrega,
                    "valor_receber_final": valor_receber_final,
                    "status": locacao[6] if locacao[6] is not None else "ativo",
                    "cliente": {
                        "nome": locacao[7] if locacao[7] is not None else "",
                        "endereco": locacao[8] if locacao[8] is not None else "",
                        "telefone": locacao[9] if locacao[9] is not None else ""
                    },
                    "itens": itens_locados
                })
                
                # Adicionar numero_nota se existir (pode ser None em registros antigos)
                if len(locacao) > 10 and locacao[10] is not None:
                    resultado[-1]["numero_nota"] = locacao[10]

            logger.info(f"{len(resultado)} locações processadas com sucesso.")
            return resultado
        except sqlite3.Error as e:
            logger.error(f"Erro ao buscar locações detalhadas: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def confirmar_devolucao(locacao_id):
        """
        Confirma a devolução de uma locação, restaurando o estoque e atualizando o status.

        Parâmetros:
            locacao_id (int): ID da locação a ser confirmada.

        Retorna:
            dict: Resultado da operação com chave 'sucesso' e 'mensagem'.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            # Verifica a existência e o status da locação
            cursor.execute('''
                SELECT status
                FROM locacoes
                WHERE id = ?
            ''', (locacao_id,))
            locacao = cursor.fetchone()

            if not locacao:
                logger.warning(f"Locação ID {locacao_id} não encontrada.")
                return {"sucesso": False, "mensagem": "Locação não encontrada"}

            status_atual = locacao[0]

            if status_atual == "concluido":
                logger.info(f"Locação ID {locacao_id} já concluída.")
                return {"sucesso": False, "mensagem": "Locação já concluída"}

            if status_atual != "ativo":
                logger.warning(f"Locação ID {locacao_id} não está ativa e não pode ser devolvida.")
                return {"sucesso": False, "mensagem": "Somente locações ativas podem ser devolvidas."}

            # Atualiza o status para "concluido" e registra a data de devolução efetiva
            data_devolucao = datetime.now()
            cursor.execute('''
                UPDATE locacoes
                SET status = 'concluido', data_devolucao_efetiva = ?
                WHERE id = ?
            ''', (data_devolucao, locacao_id))
            conn.commit()
            logger.debug(f"Status da locação ID {locacao_id} atualizado para 'concluido'.")

            # Restaura o estoque dos itens locados
            sucesso_estoque = Locacao.atualizar_estoque_devolucao(locacao_id)
            if not sucesso_estoque:
                raise ValueError("Erro ao restaurar estoque durante a confirmação de devolução.")

            logger.info(f"Devolução confirmada para locação ID {locacao_id}.")
            return {
                "sucesso": True,
                "mensagem": "Devolução confirmada com sucesso.",
                "data_devolucao": data_devolucao.strftime('%Y-%m-%d %H:%M:%S')
            }
        except (sqlite3.Error, ValueError) as e:
            logger.error(f"Erro ao confirmar devolução para locação ID {locacao_id}: {e}")
            return {"sucesso": False, "mensagem": "Erro ao confirmar devolução."}
        finally:
            release_connection(conn)

    @staticmethod
    def atualizar_estoque_devolucao(locacao_id):
        """
        Restaura o estoque dos itens locados de uma locação ao confirmar devolução.

        Parâmetros:
            locacao_id (int): ID da locação cujos itens devem ter o estoque restaurado.

        Retorna:
            bool: True se o estoque foi restaurado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            # Obtém os itens locados associados à locação
            itens_locados = ItensLocados.obter_por_locacao(locacao_id)
            if not itens_locados:
                logger.warning(f"Nenhum item encontrado para locação ID {locacao_id}.")
                return False

            for item in itens_locados:
                item_id = item.get('item_id')
                quantidade = item.get('quantidade')

                if not item_id or not quantidade:
                    logger.warning(f"Dados incompletos para item: {item}")
                    continue

                # Atualiza o estoque (aumenta a quantidade disponível)
                atualizar_estoque(item_id, quantidade)  # Chamada ajustada para aceitar dois argumentos

                logger.debug(f"Estoque restaurado para item ID {item_id} na locação ID {locacao_id}.")

            logger.info(f"Estoque restaurado para todos os itens da locação ID {locacao_id}.")
            return True
        except (sqlite3.Error, ValueError) as e:
            logger.error(f"Erro ao restaurar estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def atualizar_status(locacao_id, novo_status):
        """
        Atualiza o status de uma locação no banco de dados.
        
        Parâmetros:
            locacao_id (int): ID da locação a ser atualizada.
            novo_status (str): Novo status a ser definido.
        
        Retorna:
            bool: True se o status foi atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE locacoes
                SET status = ?
                WHERE id = ?
            ''', (novo_status, locacao_id))
            conn.commit()

            # Confirmar que a atualização foi aplicada
            if cursor.rowcount > 0:
                logger.info(f"Status da locação ID {locacao_id} atualizado para '{novo_status}'.") 
                return True
            else:
                logger.warning(f"Não foi possível atualizar o status da locação ID {locacao_id}.")
                return False
        except sqlite3.Error as e:
            logger.error(f"Erro no banco de dados ao atualizar status da locação ID {locacao_id}: {e}")
            return False
        finally:
            release_connection(conn)
            
    @staticmethod
    def delete_locacao(locacao_id):
        """
        Exclui uma locação do banco de dados.
        
        Parâmetros:
            locacao_id (int): ID da locação a ser excluída.
        
        Retorna:
            bool: True se a locação foi excluída com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            
            # Primeiro, verificar se a locação existe
            cursor.execute('SELECT id FROM locacoes WHERE id = ?', (locacao_id,))
            if not cursor.fetchone():
                logger.warning(f"Locação ID {locacao_id} não encontrada para exclusão.")
                return False
            
            # Verificar se há itens locados associados a esta locação
            cursor.execute('SELECT id FROM itens_locados WHERE locacao_id = ?', (locacao_id,))
            itens_locados = cursor.fetchall()
            
            # Excluir os itens locados associados
            if itens_locados:
                cursor.execute('DELETE FROM itens_locados WHERE locacao_id = ?', (locacao_id,))
                logger.info(f"Excluídos {len(itens_locados)} itens locados associados à locação ID {locacao_id}.")
            
            # Excluir a locação
            cursor.execute('DELETE FROM locacoes WHERE id = ?', (locacao_id,))
            conn.commit()
            
            if cursor.rowcount > 0:
                logger.info(f"Locação ID {locacao_id} excluída com sucesso.")
                return True
            else:
                logger.warning(f"Falha ao excluir locação ID {locacao_id}.")
                return False
                
        except sqlite3.Error as e:
            logger.error(f"Erro no banco de dados ao excluir locação ID {locacao_id}: {e}")
            return False
        finally:
            release_connection(conn)
