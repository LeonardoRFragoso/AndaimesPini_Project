#!/usr/bin/env python3
import sys
import hashlib
import secrets
import string
from database import get_connection, release_connection

def hash_senha(senha, salt=None):
    if salt is None:
        caracteres = string.ascii_letters + string.digits
        salt = ''.join(secrets.choice(caracteres) for _ in range(16))
    
    senha_salgada = (senha + salt).encode('utf-8')
    hash_senha = hashlib.sha256(senha_salgada).hexdigest()
    
    return hash_senha, salt

# Dados fixos do admin
nome = "Admin"
email = "admin@andaimespini.com"
senha = "Admin@2026"

print("Criando usuário admin...")
print(f"Nome: {nome}")
print(f"Email: {email}")

conn = get_connection()

if not conn:
    print("❌ Erro: Não foi possível conectar ao PostgreSQL.")
    sys.exit(1)

try:
    cursor = conn.cursor()
    
    # Verificar se já existe
    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
    if cursor.fetchone():
        print(f"✅ Admin '{email}' já existe!")
        sys.exit(0)
    
    # Hash da senha
    hash_senha_valor, salt = hash_senha(senha)
    
    # Inserir admin
    cursor.execute('''
        INSERT INTO usuarios (nome, email, hash_senha, salt, cargo)
        VALUES (%s, %s, %s, %s, %s)
    ''', (nome, email, hash_senha_valor, salt, 'admin'))
    
    conn.commit()
    
    print("=" * 60)
    print("✅ USUÁRIO ADMIN CRIADO COM SUCESSO!")
    print("=" * 60)
    print(f"Email: {email}")
    print(f"Senha: {senha}")
    print("=" * 60)
    print("⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
    print("=" * 60)
    
except Exception as e:
    conn.rollback()
    print(f"❌ Erro ao criar admin: {e}")
    sys.exit(1)
finally:
    cursor.close()
    release_connection(conn)
