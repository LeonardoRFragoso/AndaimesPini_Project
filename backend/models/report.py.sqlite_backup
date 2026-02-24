from database import get_connection, release_connection
from datetime import datetime
import logging
from io import BytesIO
import pandas as pd
import sqlite3

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Relatorios:
    @staticmethod
    def validar_data(data_texto):
        """
        Valida se a string fornecida está no formato de data 'YYYY-MM-DD'.
        
        Parâmetros:
            data_texto (str): String representando a data a ser validada.
        
        Retorna:
            bool: True se a data for válida, False caso contrário.
        """
        try:
            datetime.strptime(data_texto, '%Y-%m-%d')
            return True
        except ValueError:
            return False

    @staticmethod
    def gerar_resposta_erro(mensagem):
        """
        Gera uma resposta de erro formatada e registra no log.
        
        Parâmetros:
            mensagem (str): Mensagem de erro a ser registrada.
        
        Retorna:
            dict: Dicionário contendo a chave 'error' com a mensagem fornecida.
        """
        logger.error(mensagem)
        return {"error": mensagem}

    @staticmethod
    def aplicar_filtros_de_data(query, params, data_inicio=None, data_fim=None, prefixo=""):
        """
        Aplica filtros de data à consulta SQL fornecida.
        
        Parâmetros:
            query (str): Consulta SQL base.
            params (list): Lista de parâmetros para a consulta.
            data_inicio (str, optional): Data de início no formato 'YYYY-MM-DD'. Padrão é None.
            data_fim (str, optional): Data de fim no formato 'YYYY-MM-DD'. Padrão é None.
            prefixo (str, optional): Prefixo para os campos de data na consulta. Padrão é "".
        
        Retorna:
            tuple: Consulta SQL atualizada e lista de parâmetros, ou uma resposta de erro em caso de falha.
        """
        if data_inicio:
            if not Relatorios.validar_data(data_inicio):
                return Relatorios.gerar_resposta_erro(f"Formato de data inválido para '{prefixo}data_inicio'")
            query += f" AND {prefixo}data_inicio >= ?"
            params.append(data_inicio)
        if data_fim:
            if not Relatorios.validar_data(data_fim):
                return Relatorios.gerar_resposta_erro(f"Formato de data inválido para '{prefixo}data_fim'")
            query += f" AND {prefixo}data_fim <= ?"
            params.append(data_fim)
        return query, params

    @staticmethod
    def obter_dados_resumo():
        """
        Obtém uma visão geral básica sem filtros, incluindo total de locações, receita total,
        clientes únicos, itens únicos alugados, locações concluídas e pendentes.
        
        Retorna:
            dict: Dicionário contendo os dados de resumo ou uma resposta de erro em caso de falha.
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    logger.info("Executando consulta para obter dados de visão geral.")
                    cursor.execute("""
                        SELECT COUNT(*) AS total_locacoes,
                               COALESCE(SUM(valor_total), 0) AS receita_total,
                               COUNT(DISTINCT cliente_id) AS clientes_unicos,
                               COUNT(DISTINCT item_id) AS itens_unicos_alugados,
                               SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                               SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
                        FROM locacoes
                    """)
                    dados = cursor.fetchone()
                    resumo = {
                        "total_locacoes": dados[0] or 0,
                        "receita_total": float(dados[1]) or 0.0,
                        "clientes_unicos": dados[2] or 0,
                        "itens_unicos_alugados": dados[3] or 0,
                        "locacoes_concluidas": dados[4] or 0,
                        "locacoes_pendentes": dados[5] or 0
                    }
                    logger.info("Dados de visão geral obtidos com sucesso.")
                    return resumo
        except sqlite3.Error as e:
            return Relatorios.gerar_resposta_erro(f"Erro ao obter dados de visão geral: {e}")
    
    @staticmethod
    def obter_dados_resumo_com_filtros(data_inicio=None, data_fim=None):
        """
        Obtém uma visão geral com filtros de data, incluindo total de locações, receita total,
        clientes únicos, itens únicos alugados, locações concluídas e pendentes dentro do intervalo de datas.
        
        Parâmetros:
            data_inicio (str, optional): Data de início no formato 'YYYY-MM-DD'. Padrão é None.
            data_fim (str, optional): Data de fim no formato 'YYYY-MM-DD'. Padrão é None.
        
        Retorna:
            dict: Dicionário contendo os dados de resumo filtrados ou uma resposta de erro em caso de falha.
        """
        try:
            conn = get_connection()
            if conn is None:
                return Relatorios.gerar_resposta_erro("Não foi possível conectar ao banco de dados")
                
            cursor = conn.cursor()
            
            # Validar datas
            if data_inicio and not Relatorios.validar_data(data_inicio):
                cursor.close()
                return Relatorios.gerar_resposta_erro(f"Formato de data inválido para data_inicio")
            if data_fim and not Relatorios.validar_data(data_fim):
                cursor.close()
                return Relatorios.gerar_resposta_erro(f"Formato de data inválido para data_fim")
            
            # Construir filtros de data
            date_conditions = []
            params = []
            
            if data_inicio:
                date_conditions.append("data_inicio >= ?")
                params.append(data_inicio)
            if data_fim:
                date_conditions.append("data_fim <= ?")
                params.append(data_fim)
            
            where_clause = ""
            if date_conditions:
                where_clause = " AND " + " AND ".join(date_conditions)
            
            # Primeira consulta: dados básicos das locações
            query_locacoes = f"""
                SELECT COUNT(*) AS total_locacoes,
                       COALESCE(SUM(valor_total), 0) AS receita_total,
                       COUNT(DISTINCT cliente_id) AS clientes_unicos,
                       SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                       SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
                FROM locacoes
                WHERE 1=1{where_clause}
            """
            
            logger.info("Executando consulta para obter dados básicos de locações.")
            cursor.execute(query_locacoes, params)
            dados_locacoes = cursor.fetchone()
            
            # Segunda consulta: itens únicos alugados
            query_itens = f"""
                SELECT COUNT(DISTINCT il.item_id) AS itens_unicos_alugados
                FROM itens_locados il 
                JOIN locacoes l ON il.locacao_id = l.id
                WHERE 1=1{where_clause}
            """
            
            logger.info("Executando consulta para obter itens únicos alugados.")
            cursor.execute(query_itens, params)
            dados_itens = cursor.fetchone()
            
            # Construir resultado
            if not dados_locacoes:
                resumo = {
                    "total_locacoes": 0,
                    "receita_total": 0.0,
                    "clientes_unicos": 0,
                    "itens_unicos_alugados": 0,
                    "locacoes_concluidas": 0,
                    "locacoes_pendentes": 0
                }
            else:
                resumo = {
                    "total_locacoes": dados_locacoes[0] or 0,
                    "receita_total": float(dados_locacoes[1]) if dados_locacoes[1] else 0.0,
                    "clientes_unicos": dados_locacoes[2] or 0,
                    "itens_unicos_alugados": dados_itens[0] if dados_itens else 0,
                    "locacoes_concluidas": dados_locacoes[3] or 0,
                    "locacoes_pendentes": dados_locacoes[4] or 0
                }
            
            cursor.close()
            release_connection(conn)
            logger.info("Dados de visão geral com filtros obtidos com sucesso.")
            return resumo
            
        except sqlite3.Error as e:
            logger.error(f"Erro SQLite ao obter dados de visão geral: {e}")
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'conn' in locals() and conn:
                release_connection(conn)
            return Relatorios.gerar_resposta_erro(f"Erro ao obter dados de visão geral com filtros: {e}")
        except Exception as e:
            logger.error(f"Erro geral ao obter dados de visão geral: {e}")
            if 'cursor' in locals() and cursor:
                cursor.close()
            if 'conn' in locals() and conn:
                release_connection(conn)
            return Relatorios.gerar_resposta_erro(f"Erro inesperado ao obter dados de visão geral: {e}")
    
    @staticmethod
    def obter_relatorio_cliente(cliente_id, data_inicio=None, data_fim=None):
        """
        Obtém o relatório de um cliente específico, incluindo detalhes das locações e itens locados.
        
        Parâmetros:
            cliente_id (int): ID do cliente.
            data_inicio (str, optional): Data de início no formato 'YYYY-MM-DD'. Padrão é None.
            data_fim (str, optional): Data de fim no formato 'YYYY-MM-DD'. Padrão é None.
        
        Retorna:
            list: Lista de dicionários com detalhes das locações do cliente ou uma resposta de erro em caso de falha.
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    params = [cliente_id]
                    query = """
                        SELECT l.id, l.data_inicio, l.data_fim, COALESCE(l.valor_total, 0) AS valor_total, l.status,
                               i.nome_item, i.tipo_item, COALESCE(il.quantidade, 0) AS quantidade_locada
                        FROM locacoes AS l
                        JOIN itens_locados AS il ON l.id = il.locacao_id
                        JOIN inventario AS i ON il.item_id = i.id
                        WHERE l.cliente_id = ?
                    """
                    resultado = Relatorios.aplicar_filtros_de_data(query, params, data_inicio, data_fim, prefixo="l.")
                    if isinstance(resultado, dict):
                        return resultado
                    query, params = resultado
                    logger.info(f"Executando consulta para obter relatório do cliente ID {cliente_id}.")
                    cursor.execute(query, params)
                    locacoes = cursor.fetchall()
                    relatorio = [
                        {
                            "locacao_id": locacao[0],
                            "data_inicio": locacao[1].strftime("%Y-%m-%d") if locacao[1] else None,
                            "data_fim": locacao[2].strftime("%Y-%m-%d") if locacao[2] else None,
                            "valor_total": float(locacao[3]),
                            "status": locacao[4],
                            "nome_item": locacao[5],
                            "tipo_item": locacao[6],
                            "quantidade_locada": locacao[7]
                        }
                        for locacao in locacoes
                    ]
                    logger.info(f"Relatório do cliente ID {cliente_id} obtido com sucesso. Total de locações: {len(relatorio)}.")
                    return relatorio
        except sqlite3.Error as e:
            return Relatorios.gerar_resposta_erro(f"Erro ao obter relatório do cliente {cliente_id}: {e}")
    
    @staticmethod
    def obter_uso_inventario(item_id, data_inicio=None, data_fim=None):
        """
        Obtém o uso do inventário para um item específico, incluindo detalhes das locações em que foi alugado.
        
        Parâmetros:
            item_id (int): ID do item no inventário.
            data_inicio (str, optional): Data de início no formato 'YYYY-MM-DD'. Padrão é None.
            data_fim (str, optional): Data de fim no formato 'YYYY-MM-DD'. Padrão é None.
        
        Retorna:
            list: Lista de dicionários com detalhes das locações onde o item foi alugado ou uma resposta de erro em caso de falha.
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    params = [item_id]
                    query = """
                        SELECT l.id, l.data_inicio, l.data_fim, l.status,
                               i.nome_item, i.tipo_item, COALESCE(il.quantidade, 0) AS quantidade_locada
                        FROM locacoes AS l
                        JOIN itens_locados AS il ON l.id = il.locacao_id
                        JOIN inventario AS i ON il.item_id = i.id
                        WHERE i.id = ?
                    """
                    resultado = Relatorios.aplicar_filtros_de_data(query, params, data_inicio, data_fim, prefixo="l.")
                    if isinstance(resultado, dict):
                        return resultado
                    query, params = resultado
                    logger.info(f"Executando consulta para obter uso do inventário para item ID {item_id}.")
                    cursor.execute(query, params)
                    dados = cursor.fetchall()
                    uso_inventario = [
                        {
                            "locacao_id": dado[0],
                            "data_inicio": dado[1].strftime("%Y-%m-%d") if dado[1] else None,
                            "data_fim": dado[2].strftime("%Y-%m-%d") if dado[2] else None,
                            "status": dado[3],
                            "nome_item": dado[4],
                            "tipo_item": dado[5],
                            "quantidade_locada": dado[6]
                        }
                        for dado in dados
                    ]
                    logger.info(f"Uso do inventário para item ID {item_id} obtido com sucesso. Total de locações: {len(uso_inventario)}.")
                    return uso_inventario
        except sqlite3.Error as e:
            return Relatorios.gerar_resposta_erro(f"Erro ao obter uso do inventário para o item {item_id}: {e}")
    
    @staticmethod
    def obter_relatorio_status(data_inicio=None, data_fim=None):
        """
        Obtém o relatório de status das locações, incluindo total de locações e receita total por status.
        
        Parâmetros:
            data_inicio (str, optional): Data de início no formato 'YYYY-MM-DD'. Padrão é None.
            data_fim (str, optional): Data de fim no formato 'YYYY-MM-DD'. Padrão é None.
        
        Retorna:
            list: Lista de dicionários com detalhes do relatório de status ou uma resposta de erro em caso de falha.
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    params = []
                    query = """
                        SELECT status, COUNT(*) AS total_locacoes, COALESCE(SUM(valor_total), 0) AS receita_total
                        FROM locacoes 
                        WHERE 1=1
                    """
                    resultado = Relatorios.aplicar_filtros_de_data(query, params, data_inicio, data_fim)
                    if isinstance(resultado, dict):
                        return resultado
                    query, params = resultado
                    query += " GROUP BY status"
                    logger.info("Executando consulta para obter relatório de status das locações.")
                    cursor.execute(query, params)
                    dados = cursor.fetchall()
                    relatorio_status = [
                        {
                            "status": dado[0],
                            "total_locacoes": dado[1],
                            "receita_total": float(dado[2])
                        }
                        for dado in dados
                    ]
                    logger.info(f"Relatório de status obtido com sucesso. Total de status diferentes: {len(relatorio_status)}.")
                    return relatorio_status
        except sqlite3.Error as e:
            return Relatorios.gerar_resposta_erro(f"Erro ao obter relatório de status: {e}")
    
    @staticmethod
    def obter_relatorio_por_id(relatorio_id):
        """
        Obtém o relatório de um ID específico da tabela 'relatorios'.
        
        Parâmetros:
            relatorio_id (int): ID do relatório a ser buscado.
        
        Retorna:
            dict: Dicionário com detalhes do relatório ou uma resposta de erro em caso de falha.
        """
        try:
            with get_connection() as conn:
                with conn.cursor() as cursor:
                    logger.info(f"Executando consulta para obter relatório com ID {relatorio_id}.")
                    cursor.execute("SELECT * FROM relatorios WHERE id = ?", (relatorio_id,))
                    resultado = cursor.fetchone()
                    if resultado is None:
                        return Relatorios.gerar_resposta_erro(f"Relatório com ID {relatorio_id} não encontrado.")
                    relatorio = {
                        "id": resultado[0],
                        "data_inicio": resultado[1].strftime("%Y-%m-%d") if resultado[1] else None,
                        "data_fim": resultado[2].strftime("%Y-%m-%d") if resultado[2] else None,
                        "valor_total": float(resultado[3]) if resultado[3] else 0.0,
                        "status": resultado[4]
                    }
                    logger.info(f"Relatório com ID {relatorio_id} obtido com sucesso.")
                    return relatorio
        except sqlite3.Error as e:
            return Relatorios.gerar_resposta_erro(f"Erro ao obter relatório com ID {relatorio_id}: {e}")
