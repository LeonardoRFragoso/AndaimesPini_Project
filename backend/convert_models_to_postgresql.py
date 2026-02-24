"""
Script para converter automaticamente todos os modelos de SQLite para PostgreSQL
"""
import os
import re

def convert_sqlite_to_postgresql(content):
    """Converte código SQLite para PostgreSQL"""
    
    # Substituir imports
    content = content.replace('import sqlite3', 'import psycopg2')
    content = content.replace('from sqlite3 import', 'from psycopg2 import')
    
    # Substituir exceções
    content = content.replace('sqlite3.Error', 'psycopg2.Error')
    content = content.replace('except sqlite3.', 'except psycopg2.')
    
    # Substituir placeholders ? por %s
    content = re.sub(r'\?', '%s', content)
    
    # Substituir AUTOINCREMENT por SERIAL (em comentários ou strings SQL)
    content = content.replace('AUTOINCREMENT', 'SERIAL')
    content = content.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY')
    
    # Substituir RETURNING id pattern para PostgreSQL
    content = re.sub(
        r'RETURNING id\s*\)\s*,',
        'RETURNING id)',
        content
    )
    
    # Ajustar cursor.fetchone()[0] para funcionar com psycopg2
    # (psycopg2 retorna tuplas, não precisa de mudança)
    
    return content

def process_file(filepath):
    """Processa um arquivo Python"""
    print(f"Processando: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar se o arquivo usa sqlite3
        if 'sqlite3' not in content:
            print(f"  ⊘ Arquivo não usa sqlite3, pulando...")
            return False
        
        # Converter
        new_content = convert_sqlite_to_postgresql(content)
        
        # Criar backup
        backup_path = filepath + '.sqlite_backup'
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Salvar versão convertida
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ Convertido (backup em {backup_path})")
        return True
        
    except Exception as e:
        print(f"  ✗ Erro: {e}")
        return False

def main():
    """Processa todos os arquivos do projeto"""
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║  CONVERSÃO AUTOMÁTICA SQLITE → POSTGRESQL                 ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    # Diretórios para processar
    directories = [
        'models',
        'routes',
        '.'  # Arquivos na raiz do backend
    ]
    
    backend_path = os.path.dirname(os.path.abspath(__file__))
    converted = 0
    
    for directory in directories:
        dir_path = os.path.join(backend_path, directory)
        
        if not os.path.exists(dir_path):
            continue
        
        print(f"\n📁 Processando diretório: {directory}")
        
        # Processar arquivos .py
        if directory == '.':
            files = [f for f in os.listdir(dir_path) if f.endswith('.py') and os.path.isfile(os.path.join(dir_path, f))]
        else:
            files = [f for f in os.listdir(dir_path) if f.endswith('.py')]
        
        for filename in files:
            if filename.startswith('convert_') or filename.startswith('migrate_'):
                continue
            
            filepath = os.path.join(dir_path, filename)
            if os.path.isfile(filepath):
                if process_file(filepath):
                    converted += 1
    
    print(f"\n{'='*60}")
    print(f"✓ Conversão concluída! {converted} arquivos convertidos")
    print(f"{'='*60}")
    print("\nPróximos passos:")
    print("1. Revise os arquivos convertidos")
    print("2. Configure o arquivo .env com credenciais PostgreSQL")
    print("3. Execute: python database.py (para criar tabelas)")
    print("4. Execute: python migrate_to_postgresql.py (para migrar dados)")

if __name__ == "__main__":
    main()
