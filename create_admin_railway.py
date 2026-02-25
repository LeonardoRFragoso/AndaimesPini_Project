#!/usr/bin/env python3
"""
Script para criar usuário admin no Railway.
Uso: Copie e cole este código no Railway Shell.
"""

import os
import hashlib
import secrets
import string
import psycopg2
from psycopg2 import pool

# Configurações do banco (Railway injeta automaticamente)
DB_CONFIG = {
    'host': os.getenv('PGHOST'),
    'port': os.getenv('PGPORT', 5432),
    'database': os.getenv('PGDATABASE'),
    'user': os.getenv('PGUSER'),
    'password': os.getenv('PGPASSWORD')
}

def hash_senha(senha, salt=None):
    if salt is None:
        caracteres = string.ascii_letters + string.digits
        salt = ''.join(secrets.choice(caracteres) for _ in range(16))
    
    senha_salgada = (senha + salt).encode('utf-8')
    hash_senha = hashlib.sha256(senha_salgada).hexdigest()
    
    return hash_senha, salt

def criar_admin():
    """Cria um usuário administrador."""
    
    # Dados do admin
    nome = "Admin"
    email = "admin@andaimespini.com"
    senha = "Admin@2026"
    
    try:
        # Conectar ao PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Verificar se já existe
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            print(f"✅ Admin '{email}' já existe!")
            return
        
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
        print(f"Nome:  {nome}")
        print(f"Email: {email}")
        print(f"Senha: {senha}")
        print("=" * 60)
        print("⚠️  IMPORTANTE: Altere a senha após o primeiro login!")
        print("=" * 60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    criar_admin()
