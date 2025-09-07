import sqlite3
import os

# Caminho para o banco de dados
db_path = os.path.join(os.path.dirname(__file__), 'database', 'db.sqlite3')

def update_inventory_availability():
    print(f"Atualizando disponibilidade do inventário em: {db_path}")
    
    # Conectar ao banco de dados
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Obter todos os itens do inventário
        cursor.execute("SELECT id, nome_item, quantidade FROM inventario")
        items = cursor.fetchall()
        
        if not items:
            print("Nenhum item encontrado no inventário.")
            return
        
        print(f"Encontrados {len(items)} itens no inventário.")
        
        # Para cada item, definir quantidade_disponivel igual à quantidade
        for item in items:
            item_id, nome_item, quantidade = item
            cursor.execute(
                "UPDATE inventario SET quantidade_disponivel = ? WHERE id = ?",
                (quantidade, item_id)
            )
            print(f"Item '{nome_item}' (ID: {item_id}): quantidade_disponivel atualizada para {quantidade}")
        
        # Commit das alterações
        conn.commit()
        print("Atualização concluída com sucesso!")
        
    except sqlite3.Error as e:
        print(f"Erro ao atualizar inventário: {e}")
        conn.rollback()
    finally:
        # Fechar a conexão
        conn.close()

if __name__ == "__main__":
    update_inventory_availability()
