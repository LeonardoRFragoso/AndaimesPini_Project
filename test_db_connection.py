import sqlite3
import os
from backend.database import get_connection, release_connection

def test_database():
    try:
        print("Testing database connection...")
        
        # Test basic connection
        db_path = os.path.join('database', 'db.sqlite3')
        print(f"Database path: {db_path}")
        print(f"Database exists: {os.path.exists(db_path)}")
        
        # Test with get_connection
        conn = get_connection()
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"Tables found: {[t[0] for t in tables]}")
        
        # Check locacoes table structure
        if any('locacoes' in t for t in tables):
            cursor.execute("PRAGMA table_info(locacoes)")
            locacoes_columns = cursor.fetchall()
            print(f"Locacoes columns: {[col[1] for col in locacoes_columns]}")
            
            # Check if there's any data
            cursor.execute("SELECT COUNT(*) FROM locacoes")
            count = cursor.fetchone()[0]
            print(f"Locacoes count: {count}")
        
        # Check itens_locados table structure
        if any('itens_locados' in t for t in tables):
            cursor.execute("PRAGMA table_info(itens_locados)")
            itens_columns = cursor.fetchall()
            print(f"Itens_locados columns: {[col[1] for col in itens_columns]}")
            
            # Check if there's any data
            cursor.execute("SELECT COUNT(*) FROM itens_locados")
            count = cursor.fetchone()[0]
            print(f"Itens_locados count: {count}")
        
        release_connection(conn)
        print("Database connection test successful!")
        
    except Exception as e:
        print(f"Database test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database()
