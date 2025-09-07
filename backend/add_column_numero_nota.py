import sqlite3
import os
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caminho para o banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'db.sqlite3')

def add_numero_nota_column():
    """Adiciona a coluna numero_nota à tabela locacoes se ela não existir."""
    try:
        # Conectar ao banco de dados
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(locacoes)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'numero_nota' not in columns:
            # Adicionar a coluna numero_nota
            cursor.execute("ALTER TABLE locacoes ADD COLUMN numero_nota TEXT")
            conn.commit()
            logger.info("Coluna 'numero_nota' adicionada com sucesso à tabela 'locacoes'.")
        else:
            logger.info("A coluna 'numero_nota' já existe na tabela 'locacoes'.")
        
        # Fechar a conexão
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Erro ao adicionar coluna 'numero_nota': {e}")
        return False

if __name__ == "__main__":
    add_numero_nota_column()
