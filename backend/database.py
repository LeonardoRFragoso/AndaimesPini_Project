import sqlite3
import logging
import os

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Caminho para o banco de dados SQLite
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'db.sqlite3')

# Variável global para controlar a conexão
connection = None

def initialize_connection():
    global connection
    try:
        if connection is None:
            connection = sqlite3.connect(DB_PATH, check_same_thread=False)
            connection.row_factory = sqlite3.Row
            logger.info(f"Conexão com SQLite criada com sucesso. Banco: {DB_PATH}")
    except Exception as e:
        logger.error("Erro ao criar conexão com SQLite.", exc_info=True)
        connection = None

# Inicialize a conexão ao carregar o módulo
initialize_connection()

# Função para obter uma conexão
def get_connection():
    global connection
    try:
        if connection:
            return connection
        else:
            logger.error("A conexão não foi inicializada.")
            # Tentar inicializar novamente
            initialize_connection()
            return connection
    except Exception as e:
        logger.error("Erro ao obter conexão.", exc_info=True)
        return None

# Função para liberar a conexão (não necessária para SQLite, mas mantida para compatibilidade)
def release_connection(conn):
    # No SQLite não precisamos liberar a conexão
    pass

# Função para fechar a conexão (para uso em encerramento de aplicação)
def close_all_connections():
    global connection
    try:
        if connection:
            connection.close()
            logger.info("Conexão com SQLite fechada.")
            connection = None
    except Exception as e:
        logger.error("Erro ao fechar a conexão.", exc_info=True)

# Função para criar as tabelas necessárias
def create_tables():
    """Cria todas as tabelas necessárias no banco de dados."""
    conn = get_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()
            
            # Tabela de Usuários
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    hash_senha TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    cargo TEXT NOT NULL DEFAULT 'operador'
                )
            ''')

            # Tabela de Clientes
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS clientes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    endereco TEXT,
                    telefone TEXT NOT NULL,
                    referencia TEXT,
                    email TEXT
                )
            ''')

            # Tabela de Itens/Inventário
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS inventario (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome_item TEXT NOT NULL UNIQUE,
                    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
                    quantidade_disponivel INTEGER NOT NULL CHECK (quantidade_disponivel >= 0),
                    tipo_item TEXT NOT NULL
                )
            ''')

            # Tabela de Locações
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS locacoes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    cliente_id INTEGER NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    data_fim_original DATE,
                    valor_total REAL NOT NULL CHECK (valor_total >= 0),
                    valor_pago_entrega REAL CHECK (valor_pago_entrega >= 0),
                    valor_receber_final REAL CHECK (valor_receber_final >= 0),
                    novo_valor_total REAL CHECK (novo_valor_total >= 0),
                    abatimento REAL CHECK (abatimento >= 0),
                    data_devolucao_efetiva DATE,
                    motivo_ajuste_valor TEXT,
                    data_prorrogacao DATE,
                    status TEXT DEFAULT 'ativo',
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
                )
            ''')

            # Tabela de Itens Locados
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS itens_locados (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    locacao_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
                    data_alocacao DATE,
                    data_devolucao DATE,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            # Tabela para Registro de Danos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS registro_danos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    item_id INTEGER NOT NULL,
                    locacao_id INTEGER NOT NULL,
                    descricao_problema TEXT NOT NULL,
                    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            conn.commit()
            logger.info("Tabelas criadas ou atualizadas com sucesso!")
        except Exception as e:
            logger.error("Erro ao criar as tabelas.", exc_info=True)
            conn.rollback()
        finally:
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
    else:
        logger.error("Erro! Não foi possível estabelecer a conexão com o banco de dados.")

# Função para executar uma consulta (fetch)
def execute_query(query, params=None):
    """Executa uma consulta de fetch no banco de dados e retorna os resultados."""
    conn = get_connection()
    if conn is None:
        logger.error("Conexão não estabelecida para executar a consulta.")
        return None
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        results = cursor.fetchall()
        return results
    except Exception as e:
        logger.error("Erro ao executar a consulta de fetch.", exc_info=True)
        return None
    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()

# Função para executar um comando (commit)
def execute_command(query, params=None):
    """Executa um comando no banco de dados e aplica commit."""
    conn = get_connection()
    if conn is None:
        logger.error("Conexão não estabelecida para executar o comando.")
        return False
    try:
        cursor = conn.cursor()
        cursor.execute(query, params or ())
        conn.commit()
        return True
    except Exception as e:
        logger.error("Erro ao executar o comando no banco de dados.", exc_info=True)
        conn.rollback()
        return False
    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()

# Executa a função de criação das tabelas apenas se este arquivo for executado diretamente
if __name__ == "__main__":
    create_tables()
