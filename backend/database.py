import psycopg2
from psycopg2 import pool, Error
import logging

# Configuração do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuração global do pool de conexões
connection_pool = None

def initialize_connection_pool():
    global connection_pool
    try:
        if connection_pool is None:
            connection_pool = pool.SimpleConnectionPool(
                1, 20,  # mínimo e máximo de conexões
                dbname="projetopai",
                user="usuarioprojeto",
                password="senhaforte",
                host="localhost",
                port="5432"
            )
            if connection_pool:
                logger.info("Pool de conexões criado com sucesso.")
    except Exception as e:
        logger.error("Erro ao criar o pool de conexões.", exc_info=True)

# Inicialize o pool ao carregar o módulo
initialize_connection_pool()

# Função para obter uma conexão do pool
def get_connection():
    global connection_pool
    try:
        if connection_pool:
            conn = connection_pool.getconn()
            if conn:
                logger.debug("Conexão obtida do pool com sucesso.")
            return conn
        else:
            logger.error("O pool de conexões foi fechado ou não foi inicializado.")
            return None
    except Error as e:
        logger.error("Erro ao obter conexão do pool.", exc_info=True)
        return None

# Função para liberar a conexão de volta para o pool
def release_connection(conn):
    try:
        if conn and connection_pool:
            connection_pool.putconn(conn)
            logger.debug("Conexão retornada ao pool.")
    except Error as e:
        logger.error("Erro ao retornar conexão ao pool.", exc_info=True)

# Função para fechar todo o pool de conexões (para uso em encerramento de aplicação)
def close_all_connections():
    global connection_pool
    try:
        if connection_pool:
            connection_pool.closeall()
            logger.info("Todas as conexões do pool foram fechadas.")
            connection_pool = None
    except Error as e:
        logger.error("Erro ao fechar todas as conexões do pool.", exc_info=True)

# Função para criar as tabelas necessárias
def create_tables():
    """Cria todas as tabelas necessárias no banco de dados."""
    conn = get_connection()
    if conn is not None:
        try:
            cursor = conn.cursor()

            # Tabela de Clientes
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS clientes (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    endereco TEXT,
                    telefone VARCHAR(20) NOT NULL,
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
                    tipo_item VARCHAR(50) NOT NULL
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
                    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
                    valor_pago_entrega NUMERIC(10, 2) CHECK (valor_pago_entrega >= 0),
                    valor_receber_final NUMERIC(10, 2) CHECK (valor_receber_final >= 0),
                    novo_valor_total NUMERIC(10, 2) CHECK (novo_valor_total >= 0),
                    abatimento NUMERIC(10, 2) CHECK (abatimento >= 0),
                    data_devolucao_efetiva DATE,
                    motivo_ajuste_valor TEXT,
                    data_prorrogacao DATE,
                    status VARCHAR(20) DEFAULT 'ativo',
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
                    descricao_problema TEXT NOT NULL,
                    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            conn.commit()
            logger.info("Tabelas criadas ou atualizadas com sucesso!")
        except Error as e:
            logger.error("Erro ao criar as tabelas.", exc_info=True)
            conn.rollback()
        finally:
            if 'cursor' in locals() and cursor is not None:
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
        cursor.execute(query, params)
        results = cursor.fetchall()
        return results
    except Error as e:
        logger.error("Erro ao executar a consulta de fetch.", exc_info=True)
        return None
    finally:
        if 'cursor' in locals() and cursor is not None:
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
        cursor.execute(query, params)
        conn.commit()
        return True
    except Error as e:
        logger.error("Erro ao executar o comando no banco de dados.", exc_info=True)
        conn.rollback()
        return False
    finally:
        if 'cursor' in locals() and cursor is not None:
            cursor.close()
        release_connection(conn)

# Executa a função de criação das tabelas apenas se este arquivo for executado diretamente
if __name__ == "__main__":
    create_tables()
