from flask import jsonify
import logging

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def handle_database_error(error):
    """
    Tratamento centralizado de erros de banco de dados.
    """
    logger.error(f"Erro no banco de dados: {error}")
    return jsonify({"error": "Erro no banco de dados"}), 500

def atualizar_estoque(item_id, quantidade, cursor=None):
    """
    Atualiza o estoque para um item específico.
    :param item_id: ID do item a ser atualizado.
    :param quantidade: Quantidade a ser ajustada no estoque (pode ser negativa).
    :param cursor: Cursor de banco de dados opcional para usar transação existente.
    """
    try:
        if cursor:
            # Use existing cursor/transaction
            cursor.execute("""
                UPDATE inventario 
                SET quantidade_disponivel = quantidade_disponivel + ?
                WHERE id = ?
            """, (quantidade, item_id))
            logger.info(f"Estoque do item {item_id} ajustado em {quantidade} unidades (transação existente).")
        else:
            # Create new connection for standalone operation
            from database import get_connection, release_connection
            conn = get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE inventario 
                    SET quantidade_disponivel = quantidade_disponivel + ?
                    WHERE id = ?
                """, (quantidade, item_id))
                conn.commit()
                logger.info(f"Estoque do item {item_id} ajustado em {quantidade} unidades.")
            finally:
                release_connection(conn)
        return True
    except Exception as e:
        logger.error(f"Erro ao atualizar estoque para o item {item_id}: {e}")
        raise e

def restaurar_estoque(itens):
    """
    Restaura o estoque ao cancelar uma devolução ou ajuste.
    :param itens: Lista de itens a serem restaurados no estoque.
    """
    try:
        for item in itens:
            # Simulação de lógica para restaurar o estoque
            logger.info(f"Estoque restaurado para o item {item['id']}. Quantidade removida: {item['quantidade']}")
            # Aqui pode ser adicionada a lógica real de restauração no banco de dados
    except Exception as e:
        logger.error(f"Erro ao restaurar estoque: {e}")
        raise e
