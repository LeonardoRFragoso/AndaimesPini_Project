import psycopg2
from database import get_connection, release_connection
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Inventario:
    @staticmethod
    def create(nome_item, quantidade, tipo_item):
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO inventario (nome_item, quantidade, quantidade_disponivel, tipo_item)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (nome_item, quantidade, quantidade, tipo_item))
            item_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Item '{nome_item}' adicionado ao inventário com quantidade {quantidade} e tipo '{tipo_item}'.")
            return item_id
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao adicionar item ao inventário: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_all():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item FROM inventario')
            inventario = cursor.fetchall()
            logger.info("Itens do inventário listados com sucesso.")
            inventario_list = []
            for item in inventario:
                id = item[0]
                nome_item = item[1]
                quantidade = item[2]
                quantidade_disponivel = item[3]
                tipo_item = item[4]
                # Calculando o status do item
                if quantidade_disponivel == 0:
                    status = 'indisponível'
                elif quantidade_disponivel == quantidade:
                    status = 'disponível'
                else:
                    status = 'parcialmente disponível'
                inventario_list.append({
                    "id": id,
                    "nome_item": nome_item,
                    "quantidade": quantidade,
                    "quantidade_disponivel": quantidade_disponivel,
                    "tipo_item": tipo_item,
                    "status": status
                })
            return inventario_list
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar inventário: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def get_available():
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logger.info("Executando Inventario.get_available")
            cursor.execute('SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item FROM inventario WHERE quantidade_disponivel > 0')
            inventario_disponivel = cursor.fetchall()
            logger.info(f"Itens disponíveis no inventário listados com sucesso. Total de itens disponíveis: {len(inventario_disponivel)}")
            inventario_list = []
            for item in inventario_disponivel:
                id = item[0]
                nome_item = item[1]
                quantidade = item[2]
                quantidade_disponivel = item[3]
                tipo_item = item[4]
                # Calculando o status do item
                if quantidade_disponivel == 0:
                    status = 'indisponível'
                elif quantidade_disponivel == quantidade:
                    status = 'disponível'
                else:
                    status = 'parcialmente disponível'
                inventario_list.append({
                    "id": id,
                    "nome_item": nome_item,
                    "quantidade": quantidade,
                    "quantidade_disponivel": quantidade_disponivel,
                    "tipo_item": tipo_item,
                    "status": status
                })
            return inventario_list
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar inventário disponível: {e}")
            return []
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def atualizar_estoque(item_id, quantidade_retirada):
        """Atualiza a quantidade disponível de um item no inventário, verificando o estoque suficiente."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Primeiro, verifica se a quantidade disponível é suficiente
            cursor.execute('SELECT quantidade_disponivel FROM inventario WHERE id = %s', (item_id,))
            estoque_atual = cursor.fetchone()
            
            if not estoque_atual or estoque_atual[0] < quantidade_retirada:
                logger.warning(f"Estoque insuficiente para item ID {item_id}. Disponível: {estoque_atual[0] if estoque_atual else 'Item não encontrado'}")
                raise ValueError("Estoque insuficiente")

            # Se suficiente, realiza a atualização
            cursor.execute('''
                UPDATE inventario 
                SET quantidade_disponivel = quantidade_disponivel - %s 
                WHERE id = %s
            ''', (quantidade_retirada, item_id))
            
            conn.commit()
            logger.info(f"Estoque do item ID {item_id} atualizado, quantidade retirada: {quantidade_retirada}.")
            return True
        except (psycopg2.Error, ValueError) as e:
            conn.rollback()
            logger.error(f"Erro ao atualizar estoque para item ID {item_id} com quantidade {quantidade_retirada}: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)


    @staticmethod
    def restaurar_estoque(item_id, quantidade_reposta):
        """Restaura a quantidade disponível de um item no inventário, evitando duplicações."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            # Verifica a quantidade disponível atual
            cursor.execute('SELECT quantidade_disponivel, quantidade FROM inventario WHERE id = %s', (item_id,))
            estoque_info = cursor.fetchone()
            
            if not estoque_info:
                logger.warning(f"Item ID {item_id} não encontrado para restauração de estoque.")
                return False
            
            quantidade_disponivel, quantidade_total = estoque_info

            # Verifica se já está restaurado
            if quantidade_disponivel >= quantidade_total:
                logger.warning(f"Item ID {item_id} já está com estoque restaurado. Ação ignorada.")
                return False  # Evita restauração duplicada

            # Realiza a restauração do estoque
            cursor.execute('''
                UPDATE inventario 
                SET quantidade_disponivel = quantidade_disponivel + %s 
                WHERE id = %s
            ''', (quantidade_reposta, item_id))
            
            conn.commit()
            logger.info(f"Estoque do item ID {item_id} restaurado, quantidade reposta: {quantidade_reposta}.")
            return True
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao restaurar estoque: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)


    @staticmethod
    def update_quantidade(item_id, nova_quantidade):
        """Atualiza a quantidade total de um item no inventário, sem alterar a quantidade disponível."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                UPDATE inventario 
                SET quantidade = %s 
                WHERE id = %s
            ''', (nova_quantidade, item_id))
            conn.commit()
            logger.info(f"Quantidade total do item ID {item_id} atualizada para {nova_quantidade}.")
            return True
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao atualizar quantidade do item no inventário: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def reduce_quantity(item_id, quantidade_reduzida):
        """Reduz a quantidade disponível de um item no inventário chamando a função atualizar_estoque."""
        logger.info(f"Reduzindo a quantidade do item ID {item_id} em {quantidade_reduzida}.")
        return Inventario.atualizar_estoque(item_id, quantidade_reduzida)

    @staticmethod
    def get_item_id_by_modelo(modelo_item):
        """Obtém o ID do item com base no nome/modelo do item."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            logger.info(f"Buscando ID do item com modelo '{modelo_item}'.")
            cursor.execute('SELECT id FROM inventario WHERE nome_item = %s', (modelo_item,))
            item_id = cursor.fetchone()
            if item_id:
                logger.info(f"ID do item encontrado: {item_id[0]}")
            else:
                logger.warning(f"Item com modelo '{modelo_item}' não encontrado.")
            return item_id[0] if item_id else None
        except psycopg2.Error as e:
            logger.error(f"Erro ao buscar item por modelo: {e}")
            return None
        finally:
            cursor.close()
            release_connection(conn)

    @staticmethod
    def delete_item(item_id):
        """Exclui um item do inventário com base no ID."""
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('DELETE FROM inventario WHERE id = %s', (item_id,))
            conn.commit()
            sucesso = cursor.rowcount > 0
            if sucesso:
                logger.info(f"Item ID {item_id} excluído com sucesso.")
            else:
                logger.warning(f"Item ID {item_id} não encontrado para exclusão.")
            return sucesso
        except psycopg2.Error as e:
            conn.rollback()
            logger.error(f"Erro ao excluir item do inventário: {e}")
            return False
        finally:
            cursor.close()
            release_connection(conn)
