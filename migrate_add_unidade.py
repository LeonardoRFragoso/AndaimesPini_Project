import sqlite3
import os

# Path to the database
DB_PATH = os.path.join('database', 'db.sqlite3')

def migrate_add_unidade():
    """Add the 'unidade' column to itens_locados table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'unidade' not in columns:
            # Add the column
            cursor.execute("ALTER TABLE itens_locados ADD COLUMN unidade TEXT DEFAULT 'peças'")
            conn.commit()
            print("Added 'unidade' column to itens_locados table")
        else:
            print("Column 'unidade' already exists")
            
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_add_unidade()
