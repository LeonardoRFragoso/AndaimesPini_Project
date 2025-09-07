#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para adicionar a coluna data_devolucao à tabela itens_locados
caso ela não exista.

Este script resolve o erro: "no such column: il.data_devolucao"
"""

import sqlite3
import logging
import os

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_db_path():
    """Retorna o caminho para o arquivo do banco de dados SQLite."""
    # Caminho base do projeto
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Caminho para o banco de dados
    db_path = os.path.join(base_dir, 'database', 'db.sqlite3')
    return db_path

def check_column_exists(cursor, table, column):
    """Verifica se uma coluna existe em uma tabela."""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    return any(col[1] == column for col in columns)

def add_column_if_not_exists():
    """Adiciona a coluna data_devolucao à tabela itens_locados se ela não existir."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        logger.error(f"Banco de dados não encontrado em: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se a tabela itens_locados existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='itens_locados'")
        if not cursor.fetchone():
            logger.error("A tabela itens_locados não existe no banco de dados.")
            return False
        
        # Verificar se a coluna data_devolucao já existe
        if check_column_exists(cursor, 'itens_locados', 'data_devolucao'):
            logger.info("A coluna data_devolucao já existe na tabela itens_locados.")
            return True
        
        # Adicionar a coluna data_devolucao
        cursor.execute("ALTER TABLE itens_locados ADD COLUMN data_devolucao DATE")
        conn.commit()
        logger.info("Coluna data_devolucao adicionada com sucesso à tabela itens_locados.")
        
        return True
    except sqlite3.Error as e:
        logger.error(f"Erro ao adicionar coluna data_devolucao: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    logger.info("Iniciando verificação da coluna data_devolucao na tabela itens_locados...")
    success = add_column_if_not_exists()
    if success:
        logger.info("Operação concluída com sucesso.")
    else:
        logger.error("Falha na operação.")
