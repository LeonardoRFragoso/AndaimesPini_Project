import sqlite3
import os

# Caminho para o banco de dados
db_path = os.path.join(os.path.dirname(__file__), 'database', 'db.sqlite3')

def check_and_fix_database():
    print(f"Verificando banco de dados em: {db_path}")
    
    # Conectar ao banco de dados
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Verificar se a tabela inventario existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='inventario'")
    if cursor.fetchone():
        print("Tabela inventario encontrada.")
        
        # Verificar as colunas da tabela inventario
        cursor.execute("PRAGMA table_info(inventario)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print(f"Colunas existentes: {column_names}")
        
        # Verificar se a coluna quantidade_disponivel existe
        if 'quantidade_disponivel' not in column_names:
            print("Coluna quantidade_disponivel não encontrada. Adicionando...")
            try:
                # Adicionar a coluna quantidade_disponivel
                cursor.execute("ALTER TABLE inventario ADD COLUMN quantidade_disponivel INTEGER DEFAULT 0")
                conn.commit()
                print("Coluna quantidade_disponivel adicionada com sucesso.")
            except sqlite3.Error as e:
                print(f"Erro ao adicionar coluna: {e}")
        else:
            print("Coluna quantidade_disponivel já existe.")
    else:
        print("Tabela inventario não encontrada. Criando...")
        try:
            # Criar a tabela inventario
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS inventario (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome_item TEXT NOT NULL UNIQUE,
                    quantidade INTEGER NOT NULL CHECK (quantidade >= 0),
                    quantidade_disponivel INTEGER NOT NULL CHECK (quantidade_disponivel >= 0),
                    tipo_item TEXT NOT NULL
                )
            ''')
            conn.commit()
            print("Tabela inventario criada com sucesso.")
        except sqlite3.Error as e:
            print(f"Erro ao criar tabela: {e}")
    
    # Fechar a conexão
    conn.close()

if __name__ == "__main__":
    check_and_fix_database()
