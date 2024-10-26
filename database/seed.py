import sqlite3

def seed_database():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()

    # Inserir alguns dados de exemplo
    cursor.execute('''
        INSERT INTO clientes (nome, endereco, telefone, referencia)
        VALUES ('Cliente Exemplo', 'Rua Exemplo, 123', '123456789', 'Referência Exemplo')
    ''')

    cursor.execute('''
        INSERT INTO inventario (nome_item, quantidade, tipo_item)
        VALUES ('Andaime 1,5m', 50, 'andaimes'),
               ('Sapatas', 30, 'sapatas'),
               ('Escora 4m', 25, 'escoras')
    ''')

    conn.commit()
    conn.close()

seed_database()
