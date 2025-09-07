#!/usr/bin/env python3
import sqlite3
import os
import sys

def fix_schema():
    db_path = os.path.join('database', 'db.sqlite3')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current schema
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        print("Current itens_locados columns:", column_names)
        
        if 'unidade' not in column_names:
            print("Adding 'unidade' column...")
            cursor.execute("ALTER TABLE itens_locados ADD COLUMN unidade TEXT DEFAULT 'peças'")
            conn.commit()
            print("Column 'unidade' added successfully!")
        else:
            print("Column 'unidade' already exists.")
        
        # Verify the change
        cursor.execute("PRAGMA table_info(itens_locados)")
        columns = cursor.fetchall()
        print("Updated schema:")
        for col in columns:
            print(f"  {col[1]} {col[2]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = fix_schema()
    sys.exit(0 if success else 1)
