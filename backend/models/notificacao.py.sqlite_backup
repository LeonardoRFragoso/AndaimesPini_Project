import sqlite3
from database import get_connection, release_connection
import logging
from datetime import datetime

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Notificacao:
    @staticmethod
    def get_all():
        """
        Retorna todas as notificações do banco de dados.

        Retorna:
            list: Lista de dicionários contendo os detalhes das notificações.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info("Executando consulta para buscar todas as notificações.")
            cursor.execute("""
                SELECT id, tipo, titulo, mensagem, data_criacao, lida, relacionado_id
                FROM notificacoes
                ORDER BY data_criacao DESC
            """)
            notificacoes = cursor.fetchall()
            if not notificacoes:
                logger.info("Nenhuma notificação encontrada no banco de dados.")
                return []
            return [
                {
                    "id": notificacao[0],
                    "tipo": notificacao[1],
                    "titulo": notificacao[2],
                    "mensagem": notificacao[3],
                    "data_criacao": notificacao[4],
                    "lida": bool(notificacao[5]),
                    "relacionado_id": notificacao[6]
                }
                for notificacao in notificacoes
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar notificações no banco de dados: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def get_unread():
        """
        Retorna todas as notificações não lidas do banco de dados.

        Retorna:
            list: Lista de dicionários contendo os detalhes das notificações não lidas.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            logger.info("Executando consulta para buscar notificações não lidas.")
            cursor.execute("""
                SELECT id, tipo, titulo, mensagem, data_criacao, lida, relacionado_id
                FROM notificacoes
                WHERE lida = 0
                ORDER BY data_criacao DESC
            """)
            notificacoes = cursor.fetchall()
            if not notificacoes:
                logger.info("Nenhuma notificação não lida encontrada no banco de dados.")
                return []
            return [
                {
                    "id": notificacao[0],
                    "tipo": notificacao[1],
                    "titulo": notificacao[2],
                    "mensagem": notificacao[3],
                    "data_criacao": notificacao[4],
                    "lida": bool(notificacao[5]),
                    "relacionado_id": notificacao[6]
                }
                for notificacao in notificacoes
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar notificações não lidas no banco de dados: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def criar_notificacao(tipo, titulo, mensagem, relacionado_id=None):
        """
        Cria uma nova notificação no banco de dados.

        Parâmetros:
            tipo (str): Tipo da notificação (estoque_critico, devolucao_atrasada, etc).
            titulo (str): Título da notificação.
            mensagem (str): Mensagem detalhada da notificação.
            relacionado_id (int): ID do item relacionado (opcional).

        Retorna:
            int: ID da notificação criada ou None em caso de erro.
        """
        if not tipo or not titulo or not mensagem:
            logger.warning("Tipo, título e mensagem são obrigatórios para criar uma notificação.")
            return None

        conn = get_connection()
        try:
            cursor = conn.cursor()
            data_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO notificacoes (tipo, titulo, mensagem, data_criacao, lida, relacionado_id)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id
            """, (tipo, titulo, mensagem, data_atual, False, relacionado_id))
            conn.commit()
            notificacao_id = cursor.fetchone()[0]
            logger.info(f"Notificação criada com sucesso: ID {notificacao_id}")
            return notificacao_id
        except Exception as e:
            logger.error(f"Erro ao criar notificação: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def marcar_como_lida(notificacao_id):
        """
        Marca uma notificação como lida.

        Parâmetros:
            notificacao_id (int): ID da notificação.

        Retorna:
            bool: True se atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE notificacoes
                SET lida = 1
                WHERE id = ?
            """, (notificacao_id,))
            conn.commit()
            atualizado = cursor.rowcount > 0
            if atualizado:
                logger.info(f"Notificação ID {notificacao_id} marcada como lida.")
            else:
                logger.warning(f"Notificação ID {notificacao_id} não encontrada para atualização.")
            return atualizado
        except Exception as e:
            logger.error(f"Erro ao marcar notificação como lida: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def marcar_todas_como_lidas():
        """
        Marca todas as notificações como lidas.

        Retorna:
            bool: True se atualizado com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE notificacoes
                SET lida = 1
                WHERE lida = 0
            """)
            conn.commit()
            atualizado = cursor.rowcount > 0
            if atualizado:
                logger.info(f"Todas as notificações foram marcadas como lidas.")
            else:
                logger.warning(f"Nenhuma notificação para marcar como lida.")
            return atualizado
        except Exception as e:
            logger.error(f"Erro ao marcar todas notificações como lidas: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def excluir_notificacao(notificacao_id):
        """
        Exclui uma notificação do banco de dados.

        Parâmetros:
            notificacao_id (int): ID da notificação.

        Retorna:
            bool: True se excluído com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM notificacoes WHERE id = ?", (notificacao_id,))
            conn.commit()
            excluido = cursor.rowcount > 0
            if excluido:
                logger.info(f"Notificação ID {notificacao_id} excluída com sucesso.")
            else:
                logger.warning(f"Notificação ID {notificacao_id} não encontrada para exclusão.")
            return excluido
        except Exception as e:
            logger.error(f"Erro ao excluir notificação: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def gerar_notificacoes_automaticas():
        """
        Gera notificações automáticas com base em condições do sistema.
        Por exemplo, estoque crítico, devoluções atrasadas, etc.

        Retorna:
            int: Número de notificações geradas.
        """
        conn = get_connection()
        try:
            notificacoes_geradas = 0
            cursor = conn.cursor()
            data_atual = datetime.now().strftime("%Y-%m-%d")
            
            # Verificar itens com estoque crítico (menos de 10%)
            cursor.execute("""
                SELECT id, nome_item, quantidade, quantidade_disponivel
                FROM inventario
                WHERE quantidade > 0 AND (quantidade_disponivel * 100 / quantidade) < 10
            """)
            itens_criticos = cursor.fetchall()
            
            for item in itens_criticos:
                item_id, nome_item, quantidade, disponivel = item
                percentual = (disponivel * 100) / quantidade
                
                # Verificar se já existe notificação para este item
                cursor.execute("""
                    SELECT id FROM notificacoes 
                    WHERE tipo = 'estoque_critico' AND relacionado_id = ? AND lida = 0
                """, (item_id,))
                
                if not cursor.fetchone():
                    titulo = f"Estoque Crítico: {nome_item}"
                    mensagem = f"O item {nome_item} está com estoque crítico. Apenas {percentual:.1f}% disponível ({disponivel} de {quantidade} unidades)."
                    
                    cursor.execute("""
                        INSERT INTO notificacoes (tipo, titulo, mensagem, data_criacao, lida, relacionado_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, ('estoque_critico', titulo, mensagem, data_atual, False, item_id))
                    notificacoes_geradas += 1
            
            # Verificar devoluções atrasadas
            cursor.execute("""
                SELECT l.id, c.nome, l.data_fim
                FROM locacoes l
                JOIN clientes c ON l.cliente_id = c.id
                WHERE l.data_fim < ? AND l.status != 'concluido'
            """, (data_atual,))
            
            devolucoes_atrasadas = cursor.fetchall()
            
            for devolucao in devolucoes_atrasadas:
                locacao_id, cliente_nome, data_fim = devolucao
                
                # Verificar se já existe notificação para esta devolução
                cursor.execute("""
                    SELECT id FROM notificacoes 
                    WHERE tipo = 'devolucao_atrasada' AND relacionado_id = ? AND lida = 0
                """, (locacao_id,))
                
                if not cursor.fetchone():
                    titulo = f"Devolução Atrasada: {cliente_nome}"
                    mensagem = f"A devolução do cliente {cliente_nome} está atrasada. Data prevista: {data_fim}."
                    
                    cursor.execute("""
                        INSERT INTO notificacoes (tipo, titulo, mensagem, data_criacao, lida, relacionado_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, ('devolucao_atrasada', titulo, mensagem, data_atual, False, locacao_id))
                    notificacoes_geradas += 1
            
            conn.commit()
            logger.info(f"Geradas {notificacoes_geradas} notificações automáticas.")
            return notificacoes_geradas
            
        except Exception as e:
            logger.error(f"Erro ao gerar notificações automáticas: {e}")
            return 0
        finally:
            release_connection(conn)
