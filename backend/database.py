import psycopg2
from psycopg2 import pool, Error
import traceback

# Configuração do pool de conexões
try:
    connection_pool = pool.SimpleConnectionPool(
        1, 20,  # mínimo e máximo de conexões
        dbname="projetopai",
        user="usuarioprojeto",
        password="senhaforte",
        host="localhost",
        port="5432"
    )
    if connection_pool:
        print("Pool de conexões criado com sucesso.")
except Exception as e:
    print(f"Erro ao criar o pool de conexões: {e}")
    traceback.print_exc()

# Função para obter uma conexão do pool
def get_connection():
    try:
        conn = connection_pool.getconn()
        if conn:
            print("Conexão obtida do pool com sucesso.")
        return conn
    except Error as e:
        print(f"Erro ao obter conexão do pool: {e}")
        traceback.print_exc()

# Função para liberar a conexão de volta para o pool
def release_connection(conn):
    try:
        if conn:
            connection_pool.putconn(conn)
            print("Conexão retornada ao pool.")
    except Error as e:
        print(f"Erro ao retornar conexão ao pool: {e}")
        traceback.print_exc()

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
                    referencia TEXT
                )
            ''')

            # Tabela de Itens/Inventário
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS inventario (
                    id SERIAL PRIMARY KEY,
                    nome_item VARCHAR(255) NOT NULL,
                    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),  -- Quantidade não pode ser negativa
                    tipo_item VARCHAR(50) NOT NULL -- Ex: andaimes, escoras, etc.
                )
            ''')

            # Tabela de Locações
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS locacoes (
                    id SERIAL PRIMARY KEY,
                    cliente_id INTEGER NOT NULL,
                    data_inicio DATE NOT NULL,
                    data_fim DATE NOT NULL,
                    valor_total NUMERIC(10, 2) NOT NULL CHECK (valor_total >= 0),
                    valor_pago_entrega NUMERIC(10, 2) CHECK (valor_pago_entrega >= 0),  -- Valor pago na entrega
                    valor_receber_final NUMERIC(10, 2) CHECK (valor_receber_final >= 0),  -- Valor a receber ao final
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
                )
            ''')

            # Tabela de Itens Locados (relacionando itens com locações)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS itens_locados (
                    id SERIAL PRIMARY KEY,
                    locacao_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            # Tabela para Registro de Danos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS registro_danos (
                    id SERIAL PRIMARY KEY,
                    item_id INTEGER NOT NULL,
                    quantidade_danificada INTEGER NOT NULL CHECK (quantidade_danificada > 0),
                    locacao_id INTEGER NOT NULL,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            conn.commit()
            print("Tabelas criadas com sucesso!")
        except Error as e:
            print(f"Erro ao criar as tabelas: {e}")
            traceback.print_exc()
            conn.rollback()  # Rollback para garantir que não fiquem dados inconsistentes
        finally:
            if 'cursor' in locals() and cursor is not None:
                cursor.close()
            release_connection(conn)  # Retorna a conexão ao pool
    else:
        print("Erro! Não foi possível estabelecer a conexão com o banco de dados.")

# Executa a função de criação das tabelas apenas se este arquivo for executado diretamente
if __name__ == "__main__":
    create_tables()
