import psycopg2
from psycopg2 import pool
import logging
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações do banco de dados PostgreSQL
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'andaimes_pini'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
}

# Pool de conexões
connection_pool = None

def initialize_connection_pool():
    """Inicializa o pool de conexões PostgreSQL."""
    global connection_pool
    try:
        if connection_pool is None:
            connection_pool = psycopg2.pool.SimpleConnectionPool(
                minconn=1,
                maxconn=20,
                **DB_CONFIG
            )
            logger.info(f"Pool de conexões PostgreSQL criado com sucesso. Database: {DB_CONFIG['database']}")
    except psycopg2.Error as e:
        logger.error(f"Erro ao criar pool de conexões PostgreSQL: {e}", exc_info=True)
        connection_pool = None

# Inicializar o pool ao carregar o módulo
initialize_connection_pool()

def get_connection():
    """Obtém uma conexão do pool."""
    global connection_pool
    try:
        if connection_pool is None:
            initialize_connection_pool()
        
        if connection_pool:
            conn = connection_pool.getconn()
            if conn:
                return conn
            else:
                logger.error("Não foi possível obter conexão do pool.")
                return None
        else:
            logger.error("Pool de conexões não inicializado.")
            return None
    except psycopg2.Error as e:
        logger.error(f"Erro ao obter conexão do pool: {e}", exc_info=True)
        return None

def release_connection(conn):
    """Libera uma conexão de volta para o pool."""
    global connection_pool
    try:
        if connection_pool and conn:
            connection_pool.putconn(conn)
    except psycopg2.Error as e:
        logger.error(f"Erro ao liberar conexão: {e}", exc_info=True)

def close_all_connections():
    """Fecha todas as conexões do pool."""
    global connection_pool
    try:
        if connection_pool:
            connection_pool.closeall()
            logger.info("Pool de conexões PostgreSQL fechado.")
            connection_pool = None
    except psycopg2.Error as e:
        logger.error(f"Erro ao fechar pool de conexões: {e}", exc_info=True)

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
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    hash_senha VARCHAR(255) NOT NULL,
                    salt VARCHAR(255) NOT NULL,
                    cargo VARCHAR(50) NOT NULL DEFAULT 'operador'
                )
            ''')

            # Tabela de Clientes
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS clientes (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    endereco TEXT,
                    telefone VARCHAR(50) NOT NULL,
                    referencia TEXT,
                    email VARCHAR(255)
                )
            ''')

            # Tabela de Itens/Inventário
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS inventario (
                    id SERIAL PRIMARY KEY,
                    nome_item VARCHAR(255) NOT NULL UNIQUE,
                    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
                    quantidade_disponivel INTEGER NOT NULL CHECK (quantidade_disponivel >= 0),
                    tipo_item VARCHAR(100) NOT NULL
                )
            ''')

            # Tabela de Locações
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS locacoes (
                    id SERIAL PRIMARY KEY,
                    cliente_id INTEGER NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    data_fim_original DATE,
                    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
                    valor_pago_entrega DECIMAL(10,2) CHECK (valor_pago_entrega >= 0),
                    valor_receber_final DECIMAL(10,2) CHECK (valor_receber_final >= 0),
                    novo_valor_total DECIMAL(10,2) CHECK (novo_valor_total >= 0),
                    abatimento DECIMAL(10,2) CHECK (abatimento >= 0),
                    data_devolucao_efetiva DATE,
                    motivo_ajuste_valor TEXT,
                    data_prorrogacao DATE,
                    status VARCHAR(50) DEFAULT 'ativo',
                    numero_nota VARCHAR(100),
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
                )
            ''')

            # Tabela de Itens Locados
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS itens_locados (
                    id SERIAL PRIMARY KEY,
                    locacao_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
                    unidade VARCHAR(50) DEFAULT 'peças',
                    data_alocacao DATE,
                    data_devolucao DATE,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            # Tabela para Registro de Danos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS registro_danos (
                    id SERIAL PRIMARY KEY,
                    item_id INTEGER NOT NULL,
                    locacao_id INTEGER NOT NULL,
                    quantidade_danificada INTEGER NOT NULL DEFAULT 0,
                    descricao_problema TEXT,
                    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            # Tabela de Notificações
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notificacoes (
                    id SERIAL PRIMARY KEY,
                    tipo VARCHAR(50) NOT NULL,
                    titulo VARCHAR(255) NOT NULL,
                    mensagem TEXT NOT NULL,
                    relacionado_id INTEGER,
                    lida BOOLEAN DEFAULT FALSE,
                    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            conn.commit()
            logger.info("Tabelas PostgreSQL criadas ou atualizadas com sucesso!")
        except psycopg2.Error as e:
            logger.error(f"Erro ao criar as tabelas: {e}", exc_info=True)
            conn.rollback()
        finally:
            cursor.close()
            release_connection(conn)
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
    except psycopg2.Error as e:
        logger.error(f"Erro ao executar a consulta de fetch: {e}", exc_info=True)
        return None
    finally:
        cursor.close()
        release_connection(conn)

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
    except psycopg2.Error as e:
        logger.error(f"Erro ao executar o comando no banco de dados: {e}", exc_info=True)
        conn.rollback()
        return False
    finally:
        cursor.close()
        release_connection(conn)

# Executa a função de criação das tabelas apenas se este arquivo for executado diretamente
if __name__ == "__main__":
    create_tables()
