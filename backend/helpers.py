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

def atualizar_estoque(itens):
    """
    Atualiza o estoque ao registrar devoluções ou ajustes.
    :param itens: Lista de itens a serem atualizados no estoque.
    """
    try:
        for item in itens:
            # Simulação de lógica para atualizar o estoque
            # Aqui você pode usar a lógica para incrementar a quantidade disponível
            logger.info(f"Estoque atualizado para o item {item['id']}. Quantidade adicionada: {item['quantidade']}")
    except Exception as e:
        logger.error(f"Erro ao atualizar estoque: {e}")
        raise e

def restaurar_estoque(itens):
    """
    Restaura o estoque ao cancelar uma devolução ou ajuste.
    :param itens: Lista de itens a serem restaurados no estoque.
    """
    try:
        for item in itens:
            # Simulação de lógica para restaurar o estoque
            # Aqui você pode usar a lógica para decrementar a quantidade disponível
            logger.info(f"Estoque restaurado para o item {item['id']}. Quantidade removida: {item['quantidade']}")
    except Exception as e:
        logger.error(f"Erro ao restaurar estoque: {e}")
        raise e
