import psycopg2
from psycopg2 import Error

# Função para criar a conexão com o banco de dados PostgreSQL
def create_connection():
    """Cria uma conexão com o banco de dados PostgreSQL."""
    conn = None
    try:
        # Defina as informações de conexão do PostgreSQL
        conn = psycopg2.connect(
            dbname="projetopai",
            user="usuarioprojeto",
            password="senhaforte",
            host="localhost",
            port="5432"
        )
        print("Conexão com o banco de dados PostgreSQL estabelecida.")
    except Error as e:
        print(f"Erro ao conectar com o banco de dados: {e}")
    return conn


# Função para criar as tabelas necessárias
def create_tables():
    """Cria todas as tabelas necessárias no banco de dados."""
    conn = create_connection()
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
                    quantidade INTEGER NOT NULL,
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
                    valor_total NUMERIC(10, 2) NOT NULL,
                    valor_pago_entrega NUMERIC(10, 2),  -- Valor pago na entrega
                    valor_receber_final NUMERIC(10, 2),  -- Valor a receber ao final
                    FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
                )
            ''')

            # Tabela de Itens Locados (relacionando itens com locações)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS itens_locados (
                    id SERIAL PRIMARY KEY,
                    locacao_id INTEGER NOT NULL,
                    item_id INTEGER NOT NULL,
                    quantidade INTEGER NOT NULL,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            # Tabela para Registro de Danos
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS registro_danos (
                    id SERIAL PRIMARY KEY,
                    item_id INTEGER NOT NULL,
                    quantidade_danificada INTEGER NOT NULL,
                    locacao_id INTEGER NOT NULL,
                    FOREIGN KEY (locacao_id) REFERENCES locacoes (id) ON DELETE CASCADE,
                    FOREIGN KEY (item_id) REFERENCES inventario (id) ON DELETE CASCADE
                )
            ''')

            conn.commit()
            print("Tabelas criadas com sucesso!")
        except Error as e:
            print(f"Erro ao criar as tabelas: {e}")
            conn.rollback()  # Rollback para garantir que não fiquem dados inconsistentes
        finally:
            cursor.close()
            conn.close()  # Certificar que a conexão será fechada
    else:
        print("Erro! Não foi possível estabelecer a conexão com o banco de dados.")

# Executa a função de criação das tabelas apenas se este arquivo for executado diretamente
if __name__ == "__main__":
    create_tables()
