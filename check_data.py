import sqlite3
import os

def check_database_data():
    """Verifica se existem dados nas tabelas principais"""
    db_path = os.path.join('database', 'db.sqlite3')
    
    if not os.path.exists(db_path):
        print("❌ Banco de dados não encontrado!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar tabelas existentes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"📋 Tabelas encontradas: {tables}")
        
        # Verificar dados em cada tabela principal
        if 'locacoes' in tables:
            cursor.execute("SELECT COUNT(*) FROM locacoes")
            locacoes_count = cursor.fetchone()[0]
            print(f"📦 Locações: {locacoes_count} registros")
            
            if locacoes_count > 0:
                cursor.execute("SELECT id, cliente_id, data_inicio, data_fim, valor_total, status FROM locacoes LIMIT 3")
                sample_locacoes = cursor.fetchall()
                print("📋 Amostra de locações:")
                for loc in sample_locacoes:
                    print(f"  ID: {loc[0]}, Cliente: {loc[1]}, Início: {loc[2]}, Fim: {loc[3]}, Valor: {loc[4]}, Status: {loc[5]}")
        
        if 'clientes' in tables:
            cursor.execute("SELECT COUNT(*) FROM clientes")
            clientes_count = cursor.fetchone()[0]
            print(f"👥 Clientes: {clientes_count} registros")
        
        if 'inventario' in tables:
            cursor.execute("SELECT COUNT(*) FROM inventario")
            inventario_count = cursor.fetchone()[0]
            print(f"📦 Inventário: {inventario_count} registros")
        
        if 'itens_locados' in tables:
            cursor.execute("SELECT COUNT(*) FROM itens_locados")
            itens_count = cursor.fetchone()[0]
            print(f"🔗 Itens locados: {itens_count} registros")
        
        # Testar a query do relatório diretamente
        print("\n🔍 Testando query do relatório:")
        cursor.execute("""
            SELECT COUNT(*) AS total_locacoes,
                   COALESCE(SUM(valor_total), 0) AS receita_total,
                   COUNT(DISTINCT cliente_id) AS clientes_unicos,
                   SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                   SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
            FROM locacoes
            WHERE 1=1
        """)
        result = cursor.fetchone()
        print(f"📊 Resultado da query:")
        print(f"  Total locações: {result[0]}")
        print(f"  Receita total: {result[1]}")
        print(f"  Clientes únicos: {result[2]}")
        print(f"  Locações concluídas: {result[3]}")
        print(f"  Locações pendentes: {result[4]}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_database_data()
