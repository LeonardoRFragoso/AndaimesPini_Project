import sqlite3
import os
import logging
from datetime import date

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caminho para o banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'db.sqlite3')

def add_data_alocacao_column():
    """Adiciona a coluna data_alocacao à tabela itens_locados se ela não existir."""
    try:
        # Conectar ao banco de dados
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'data_alocacao' not in columns:
            # Adicionar a coluna data_alocacao
            cursor.execute("ALTER TABLE itens_locados ADD COLUMN data_alocacao DATE")
            conn.commit()
            logger.info("Coluna 'data_alocacao' adicionada com sucesso à tabela 'itens_locados'.")
            
            # Atualizar registros existentes com a data atual
            cursor.execute("UPDATE itens_locados SET data_alocacao = ? WHERE data_alocacao IS NULL", (date.today().isoformat(),))
            conn.commit()
            logger.info(f"Atualizados {cursor.rowcount} registros com data_alocacao = {date.today().isoformat()}")
        else:
            logger.info("A coluna 'data_alocacao' já existe na tabela 'itens_locados'.")
        
        # Fechar a conexão
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Erro ao adicionar coluna 'data_alocacao': {e}")
        return False

if __name__ == "__main__":
    add_data_alocacao_column()
