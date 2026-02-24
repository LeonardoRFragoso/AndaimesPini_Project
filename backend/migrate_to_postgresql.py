"""
Script de migração de dados de SQLite para PostgreSQL
Execute este script após configurar o PostgreSQL e criar as tabelas
"""
import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Configuração SQLite
SQLITE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'database', 'db.sqlite3')

# Configuração PostgreSQL
PG_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'andaimes_pini'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
}

def migrate_data():
    """Migra todos os dados do SQLite para PostgreSQL"""
    print("Iniciando migração de SQLite para PostgreSQL...")
    
    # Conectar aos bancos
    try:
        sqlite_conn = sqlite3.connect(SQLITE_PATH)
        sqlite_conn.row_factory = sqlite3.Row
        pg_conn = psycopg2.connect(**PG_CONFIG)
        
        print("✓ Conexões estabelecidas")
        
        # Migrar tabelas na ordem correta (respeitando foreign keys)
        tables = [
            ('usuarios', ['nome', 'email', 'hash_senha', 'salt', 'cargo']),
            ('clientes', ['nome', 'endereco', 'telefone', 'referencia', 'email']),
            ('inventario', ['nome_item', 'quantidade', 'quantidade_disponivel', 'tipo_item']),
            ('locacoes', ['cliente_id', 'data_inicio', 'data_fim', 'data_fim_original', 
                         'valor_total', 'valor_pago_entrega', 'valor_receber_final', 
                         'novo_valor_total', 'abatimento', 'data_devolucao_efetiva', 
                         'motivo_ajuste_valor', 'data_prorrogacao', 'status', 'numero_nota']),
            ('itens_locados', ['locacao_id', 'item_id', 'quantidade', 'unidade', 
                              'data_alocacao', 'data_devolucao']),
            ('registro_danos', ['item_id', 'locacao_id', 'quantidade_danificada', 
                               'descricao_problema', 'data_registro']),
            ('notificacoes', ['tipo', 'titulo', 'mensagem', 'relacionado_id', 'lida', 'data_criacao'])
        ]
        
        sqlite_cursor = sqlite_conn.cursor()
        pg_cursor = pg_conn.cursor()
        
        for table_name, columns in tables:
            print(f"\nMigrando tabela: {table_name}")
            
            # Verificar se tabela existe no SQLite
            sqlite_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            if not sqlite_cursor.fetchone():
                print(f"  ⚠ Tabela {table_name} não existe no SQLite, pulando...")
                continue
            
            # Buscar dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"  ℹ Nenhum dado encontrado em {table_name}")
                continue
            
            # Preparar query de inserção
            placeholders = ', '.join(['%s'] * len(columns))
            insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
            
            # Inserir dados no PostgreSQL
            migrated = 0
            for row in rows:
                try:
                    # Extrair valores nas colunas corretas
                    values = [row[col] if col in row.keys() else None for col in columns]
                    pg_cursor.execute(insert_query, values)
                    migrated += 1
                except psycopg2.Error as e:
                    print(f"  ✗ Erro ao migrar registro: {e}")
                    continue
            
            pg_conn.commit()
            print(f"  ✓ {migrated} registros migrados")
        
        # Atualizar sequences do PostgreSQL
        print("\nAtualizando sequences...")
        for table_name, _ in tables:
            try:
                pg_cursor.execute(f"""
                    SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 
                    COALESCE((SELECT MAX(id) FROM {table_name}), 1), true)
                """)
                print(f"  ✓ Sequence de {table_name} atualizada")
            except psycopg2.Error as e:
                print(f"  ⚠ Erro ao atualizar sequence de {table_name}: {e}")
        
        pg_conn.commit()
        
        print("\n" + "="*50)
        print("✓ Migração concluída com sucesso!")
        print("="*50)
        
    except sqlite3.Error as e:
        print(f"✗ Erro no SQLite: {e}")
    except psycopg2.Error as e:
        print(f"✗ Erro no PostgreSQL: {e}")
    finally:
        if 'sqlite_conn' in locals():
            sqlite_conn.close()
        if 'pg_conn' in locals():
            pg_conn.close()

if __name__ == "__main__":
    print("""
    ╔════════════════════════════════════════════════════════════╗
    ║  MIGRAÇÃO SQLITE → POSTGRESQL - AndaimesPini Project      ║
    ╚════════════════════════════════════════════════════════════╝
    
    ATENÇÃO: 
    1. Certifique-se de que o PostgreSQL está rodando
    2. Configure o arquivo .env com as credenciais corretas
    3. Execute 'python database.py' para criar as tabelas primeiro
    4. Este script irá copiar TODOS os dados do SQLite para PostgreSQL
    
    Deseja continuar? (s/n): """)
    
    resposta = input().strip().lower()
    if resposta == 's':
        migrate_data()
    else:
        print("Migração cancelada.")
