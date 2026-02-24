import sys
import hashlib
import secrets
import string
from database import get_connection, release_connection
import psycopg2

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
    """
    Cria um usuário administrador no PostgreSQL.
    """
    # Conectar ao banco de dados PostgreSQL
    conn = get_connection()
    
    if not conn:
        print("❌ Erro: Não foi possível conectar ao PostgreSQL.")
        print("Verifique se o PostgreSQL está rodando e as credenciais no .env estão corretas.")
        return False
    
    try:
        cursor = conn.cursor()
        
        # Verificar se o email já está em uso
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"❌ Erro: Email '{email}' já está em uso.")
            return False
        
        # Hash da senha
        hash_senha_valor, salt = hash_senha(senha)
        
        # Inserir o usuário administrador
        cursor.execute('''
            INSERT INTO usuarios (nome, email, hash_senha, salt, cargo)
            VALUES (%s, %s, %s, %s, %s)
        ''', (nome, email, hash_senha_valor, salt, 'admin'))
        
        # Commit das alterações
        conn.commit()
        
        print(f"✅ Usuário administrador '{nome}' criado com sucesso!")
        print(f"   Email: {email}")
        print(f"   Cargo: admin")
        return True
    
    except psycopg2.Error as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")
        conn.rollback()
        return False
    
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        conn.rollback()
        return False
    
    finally:
        cursor.close()
        release_connection(conn)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python create_admin.py <nome> <email> <senha>")
        sys.exit(1)
    
    nome = sys.argv[1]
    email = sys.argv[2]
    senha = sys.argv[3]
    
    criar_admin(nome, email, senha)
