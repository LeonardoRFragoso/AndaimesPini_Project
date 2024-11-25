import psycopg2
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
            with conn:
                with conn.cursor() as cursor:
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
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    ''', (cliente_id, data_inicio, data_fim, valor_total, valor_pago_entrega, valor_receber_final, status, numero_nota))
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
                                VALUES (%s, %s, %s, %s)
                            ''', (locacao_id, item_id, quantidade, unidade))
                            logger.debug(f"Item adicionado à locação: {modelo} (Qtd: {quantidade})")

                            # Atualizar estoque
                            atualizar_estoque(item_id, -quantidade)  # Chamada ajustada para aceitar dois argumentos

            logger.info(f"Locação registrada com sucesso: ID {locacao_id}")
            return locacao_id
        except (psycopg2.Error, ValueError) as e:
            logger.error(f"Erro ao criar locação: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def obter_todas_detalhadas():
        """
        Obtém todas as locações com detalhes completos, incluindo informações do cliente e itens locados.

        Retorna:
            list: Lista de dicionários com detalhes das locações.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute('''
                        SELECT locacoes.id, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total,
                               locacoes.valor_pago_entrega, locacoes.valor_receber_final, locacoes.status,
                               clientes.nome, clientes.endereco, clientes.telefone, locacoes.numero_nota
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

                        resultado.append({
                            "id": locacao_id,
                            "data_inicio": locacao[1].strftime("%Y-%m-%d"),
                            "data_fim": locacao[2].strftime("%Y-%m-%d"),
                            "valor_total": float(locacao[3]) if locacao[3] else 0.0,
                            "valor_pago_entrega": float(locacao[4]) if locacao[4] else 0.0,
                            "valor_receber_final": float(locacao[5]) if locacao[5] else (float(locacao[3]) - float(locacao[4])),
                            "status": locacao[6],
                            "cliente": {
                                "nome": locacao[7],
                                "endereco": locacao[8],
                                "telefone": locacao[9]
                            },
                            "numero_nota": locacao[10],  # Novo campo
                            "itens": itens_locados
                        })

                    logger.info(f"{len(resultado)} locações processadas com sucesso.")
                    return resultado
        except psycopg2.Error as e:
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
            with conn:
                with conn.cursor() as cursor:
                    # Verifica a existência e o status da locação
                    cursor.execute('''
                        SELECT status
                        FROM locacoes
                        WHERE id = %s
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
                        SET status = 'concluido', data_devolucao_efetiva = %s
                        WHERE id = %s
                    ''', (data_devolucao, locacao_id))
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
        except (psycopg2.Error, ValueError) as e:
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
            with conn:
                with conn.cursor() as cursor:
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
        except (psycopg2.Error, ValueError) as e:
            logger.error(f"Erro ao restaurar estoque para locação ID {locacao_id}: {e}")
            return False
        finally:
            release_connection(conn)
