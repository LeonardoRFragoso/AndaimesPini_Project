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

def atualizar_estoque(item_id, quantidade):
    """
    Atualiza o estoque para um item específico.
    :param item_id: ID do item a ser atualizado.
    :param quantidade: Quantidade a ser ajustada no estoque (pode ser negativa).
    """
    try:
        # Simulação de lógica para atualizar o estoque
        logger.info(f"Estoque do item {item_id} ajustado em {quantidade} unidades.")
        # Aqui pode ser adicionada a lógica real de atualização no banco de dados
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
