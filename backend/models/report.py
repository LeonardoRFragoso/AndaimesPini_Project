from database import get_connection
from datetime import datetime
import logging
from io import BytesIO
import pandas as pd

logger = logging.getLogger(__name__)

# Funções de validação e geração de respostas de erro
def validate_date(date_text):
    try:
        datetime.strptime(date_text, '%Y-%m-%d')
        return True
    except ValueError:
        return False

def generate_error_response(message):
    logger.error(message)
    return {"error": message}

def apply_date_filters(query, params, start_date=None, end_date=None, prefix=""):
    if start_date:
        if not validate_date(start_date):
            return generate_error_response(f"Formato de data inválido para '{prefix}start_date'")
        query += f" AND {prefix}data_inicio >= %s"
        params.append(start_date)
    if end_date:
        if not validate_date(end_date):
            return generate_error_response(f"Formato de data inválido para '{prefix}end_date'")
        query += f" AND {prefix}data_fim <= %s"
        params.append(end_date)
    return query

# Função de visão geral básica sem filtros
def obter_dados_resumo():
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) AS total_locacoes,
                           COALESCE(SUM(valor_total), 0) AS receita_total,
                           COUNT(DISTINCT cliente_id) AS clientes_unicos,
                           COUNT(DISTINCT item_id) AS itens_unicos_alugados,
                           SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                           SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
                    FROM locacoes
                """)
                data = cursor.fetchone()
                return {
                    "total_locacoes": data[0] or 0,
                    "receita_total": data[1] or 0,
                    "clientes_unicos": data[2] or 0,
                    "itens_unicos_alugados": data[3] or 0,
                    "locacoes_concluidas": data[4] or 0,
                    "locacoes_pendentes": data[5] or 0
                }
    except Exception as e:
        return generate_error_response(f"Erro ao obter dados de visão geral: {e}")

# Função de visão geral com filtros de data
def get_overview_data(start_date=None, end_date=None):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                params = []
                query = """
                    SELECT COUNT(*) AS total_locacoes,
                           COALESCE(SUM(valor_total), 0) AS receita_total,
                           COUNT(DISTINCT cliente_id) AS clientes_unicos,
                           COUNT(DISTINCT item_id) AS itens_unicos_alugados,
                           SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                           SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
                    FROM locacoes AS l
                    LEFT JOIN itens_locados AS il ON l.id = il.locacao_id
                    WHERE 1=1
                """
                query = apply_date_filters(query, params, start_date, end_date, prefix="l.")
                if isinstance(query, dict):
                    return query

                cursor.execute(query, params)
                data = cursor.fetchone()
                return {
                    "total_locacoes": data[0] or 0,
                    "receita_total": data[1] or 0,
                    "clientes_unicos": data[2] or 0,
                    "itens_unicos_alugados": data[3] or 0,
                    "locacoes_concluidas": data[4] or 0,
                    "locacoes_pendentes": data[5] or 0
                }
    except Exception as e:
        return generate_error_response(f"Erro ao obter dados de visão geral: {e}")

# Função para obter o relatório de um cliente específico
def get_client_report(cliente_id, start_date=None, end_date=None):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                params = [cliente_id]
                query = """
                    SELECT l.id, l.data_inicio, l.data_fim, COALESCE(l.valor_total, 0), l.status,
                           i.nome_item, i.tipo_item, COALESCE(il.quantidade, 0)
                    FROM locacoes AS l
                    JOIN itens_locados AS il ON l.id = il.locacao_id
                    JOIN inventario AS i ON il.item_id = i.id
                    WHERE l.cliente_id = %s
                """
                query = apply_date_filters(query, params, start_date, end_date, prefix="l.")
                if isinstance(query, dict):
                    return query

                cursor.execute(query, params)
                locacoes = cursor.fetchall()
                return [
                    {
                        "locacao_id": row[0],
                        "data_inicio": row[1],
                        "data_fim": row[2],
                        "valor_total": row[3],
                        "status": row[4],
                        "nome_item": row[5],
                        "tipo_item": row[6],
                        "quantidade": row[7]
                    }
                    for row in locacoes
                ]
    except Exception as e:
        return generate_error_response(f"Erro ao obter relatório do cliente {cliente_id}: {e}")

# Função para obter o uso do inventário para um item específico
def get_inventory_usage(item_id, start_date=None, end_date=None):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                params = [item_id]
                query = """
                    SELECT l.id, l.data_inicio, l.data_fim, l.status,
                           i.nome_item, i.tipo_item, COALESCE(il.quantidade, 0)
                    FROM locacoes AS l
                    JOIN itens_locados AS il ON l.id = il.locacao_id
                    JOIN inventario AS i ON il.item_id = i.id
                    WHERE i.id = %s
                """
                query = apply_date_filters(query, params, start_date, end_date, prefix="l.")
                if isinstance(query, dict):
                    return query

                cursor.execute(query, params)
                data = cursor.fetchall()
                return [
                    {
                        "locacao_id": row[0],
                        "data_inicio": row[1],
                        "data_fim": row[2],
                        "status": row[3],
                        "quantidade": row[6]
                    }
                    for row in data
                ]
    except Exception as e:
        return generate_error_response(f"Erro ao obter uso do inventário para o item {item_id}: {e}")

# Função para obter o relatório de status
def get_status_report(start_date=None, end_date=None):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                params = []
                query = """
                    SELECT status, COUNT(*) AS total_locacoes, COALESCE(SUM(valor_total), 0) AS receita_total
                    FROM locacoes 
                    WHERE 1=1
                """
                query = apply_date_filters(query, params, start_date, end_date)
                if isinstance(query, dict):
                    return query

                query += " GROUP BY status"
                cursor.execute(query, params)
                data = cursor.fetchall()
                return [{"status": row[0], "total_locacoes": row[1], "receita_total": row[2]} for row in data]
    except Exception as e:
        return generate_error_response(f"Erro ao obter relatório de status: {e}")

# Função para obter relatório por ID
def obter_relatorio_por_id(relatorio_id):
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                query = "SELECT * FROM relatorios WHERE id = %s"
                cursor.execute(query, (relatorio_id,))
                resultado = cursor.fetchone()
                if resultado is None:
                    return generate_error_response(f"Relatório com ID {relatorio_id} não encontrado.")
                return {
                    "id": resultado[0],
                    "data_inicio": resultado[1],
                    "data_fim": resultado[2],
                    "valor_total": resultado[3],
                    "status": resultado[4]
                }
    except Exception as e:
        return generate_error_response(f"Erro ao obter relatório com ID {relatorio_id}: {e}")
