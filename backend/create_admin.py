import sqlite3
import sys
import os
import hashlib
import secrets
import string

# Função para criar hash de senha
def hash_senha(senha, salt=None):
    if salt is None:
        # Gerar um salt aleatório
        caracteres = string.ascii_letters + string.digits
        salt = ''.join(secrets.choice(caracteres) for _ in range(16))
    
    # Combinar senha e salt, e criar o hash
    senha_salgada = (senha + salt).encode('utf-8')
    hash_senha = hashlib.sha256(senha_salgada).hexdigest()
    
    return hash_senha, salt

def criar_admin(nome, email, senha):
    # Caminho para o banco de dados
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'db.sqlite3')
    
    # Verificar se o banco de dados existe
    if not os.path.exists(db_path):
        print(f"Erro: Banco de dados não encontrado em {db_path}")
        return False
    
    # Conectar ao banco de dados
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se a tabela usuarios existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'")
        if not cursor.fetchone():
            # Criar a tabela usuarios se não existir
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
            print("Tabela 'usuarios' criada com sucesso.")
        
        # Verificar se o email já está em uso
        cursor.execute("SELECT id FROM usuarios WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"Erro: Email '{email}' já está em uso.")
            return False
        
        # Hash da senha
        hash_senha_valor, salt = hash_senha(senha)
        
        # Inserir o usuário administrador
        cursor.execute('''
            INSERT INTO usuarios (nome, email, hash_senha, salt, cargo)
            VALUES (?, ?, ?, ?, ?)
        ''', (nome, email, hash_senha_valor, salt, 'admin'))
        
        # Commit das alterações
        conn.commit()
        
        print(f"Usuário administrador '{nome}' criado com sucesso!")
        return True
    
    except Exception as e:
        print(f"Erro ao criar usuário administrador: {e}")
        return False
    
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python create_admin.py <nome> <email> <senha>")
        sys.exit(1)
    
    nome = sys.argv[1]
    email = sys.argv[2]
    senha = sys.argv[3]
    
    criar_admin(nome, email, senha)
