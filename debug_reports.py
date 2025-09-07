import sys
import os
import sqlite3

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_database_direct():
    """Test database connection and queries directly"""
    try:
        # Direct database connection
        db_path = os.path.join('database', 'db.sqlite3')
        print(f"Database path: {db_path}")
        print(f"Database exists: {os.path.exists(db_path)}")
        
        if not os.path.exists(db_path):
            print("ERROR: Database file does not exist!")
            return
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cursor.fetchall()]
        print(f"Tables: {tables}")
        
        # Check if required tables exist
        required_tables = ['locacoes', 'itens_locados', 'inventario', 'clientes']
        missing_tables = [t for t in required_tables if t not in tables]
        if missing_tables:
            print(f"ERROR: Missing tables: {missing_tables}")
            return
            
        # Test basic query on locacoes
        cursor.execute("SELECT COUNT(*) FROM locacoes")
        locacoes_count = cursor.fetchone()[0]
        print(f"Locacoes count: {locacoes_count}")
        
        # Test basic query on itens_locados
        cursor.execute("SELECT COUNT(*) FROM itens_locados")
        itens_count = cursor.fetchone()[0]
        print(f"Itens_locados count: {itens_count}")
        
        # Test the actual query from the report
        query = """
            SELECT COUNT(*) AS total_locacoes,
                   COALESCE(SUM(valor_total), 0) AS receita_total,
                   COUNT(DISTINCT cliente_id) AS clientes_unicos,
                   SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS locacoes_concluidas,
                   SUM(CASE WHEN status != 'concluido' THEN 1 ELSE 0 END) AS locacoes_pendentes
            FROM locacoes
            WHERE 1=1
        """
        
        print("Testing main query...")
        cursor.execute(query)
        result = cursor.fetchone()
        print(f"Main query result: {result}")
        
        # Test items query
        items_query = """
            SELECT COUNT(DISTINCT il.item_id) AS itens_unicos_alugados
            FROM itens_locados il 
            JOIN locacoes l ON il.locacao_id = l.id
            WHERE 1=1
        """
        
        print("Testing items query...")
        cursor.execute(items_query)
        items_result = cursor.fetchone()
        print(f"Items query result: {items_result}")
        
        conn.close()
        print("Direct database test completed successfully!")
        
    except Exception as e:
        print(f"Direct database test failed: {e}")
        import traceback
        traceback.print_exc()

def test_with_backend_models():
    """Test using the backend models"""
    try:
        print("\nTesting with backend models...")
        from database import get_connection
        from models.report import Relatorios
        
        # Test connection
        conn = get_connection()
        if conn is None:
            print("ERROR: Could not get database connection")
            return
        print("Database connection successful")
        
        # Test the report function
        result = Relatorios.obter_dados_resumo_com_filtros()
        print(f"Report result: {result}")
        
        if isinstance(result, dict) and "error" in result:
            print(f"ERROR in report: {result['error']}")
        else:
            print("Report function successful!")
            
    except Exception as e:
        print(f"Backend models test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database_direct()
    test_with_backend_models()
