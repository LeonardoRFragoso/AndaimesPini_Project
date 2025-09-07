import sqlite3
import os

# Caminho para o banco de dados
DB_PATH = os.path.join('database', 'db.sqlite3')

def add_unidade_column():
    """Adiciona a coluna 'unidade' à tabela itens_locados se ela não existir."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Verificar se a coluna já existe
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'unidade' not in columns:
            print("Adicionando coluna 'unidade' à tabela itens_locados...")
            cursor.execute("ALTER TABLE itens_locados ADD COLUMN unidade TEXT DEFAULT 'peças'")
            conn.commit()
            print("Coluna 'unidade' adicionada com sucesso!")
        else:
            print("Coluna 'unidade' já existe na tabela itens_locados.")
            
        # Mostrar schema atual
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = cursor.fetchall()
        print("\nSchema atual da tabela itens_locados:")
        for column in columns:
            print(f"  {column[1]} {column[2]} {'NOT NULL' if column[3] else ''} {'DEFAULT ' + str(column[4]) if column[4] else ''}")
            
        conn.close()
        
    except Exception as e:
        print(f"Erro ao adicionar coluna: {e}")

if __name__ == "__main__":
    add_unidade_column()
