from database import get_connection

def get_overview_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COUNT(*) AS total_locacoes, SUM(valor_total) AS receita_total
        FROM locacoes
    """)
    data = cursor.fetchone()
    cursor.close()
    conn.close()
    return {
        "total_locacoes": data[0],
        "receita_total": data[1]
    }

def get_client_report(cliente_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT l.id, l.data_inicio, l.data_fim, l.valor_total, l.status,
               i.nome_item, i.tipo_item, il.quantidade
        FROM locacoes AS l
        JOIN itens_locados AS il ON l.id = il.locacao_id
        JOIN inventario AS i ON il.item_id = i.id
        WHERE l.cliente_id = %s
    """, (cliente_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return [
        {
            "locacao_id": row[0],
            "data_inicio": row[1],
            "data_fim": row[2],
            "valor_total": row[3],
            "status": row[4],
            "nome_item": row[5],
            "tipo_item": row[6],
            "quantidade": row[7]
        }
        for row in data
    ]

def get_inventory_usage(item_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT l.id, l.data_inicio, l.data_fim, l.status,
               i.nome_item, il.quantidade
        FROM locacoes AS l
        JOIN itens_locados AS il ON l.id = il.locacao_id
        JOIN inventario AS i ON il.item_id = i.id
        WHERE i.id = %s
    """, (item_id,))
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return [
        {
            "locacao_id": row[0],
            "data_inicio": row[1],
            "data_fim": row[2],
            "status": row[3],
            "nome_item": row[4],
            "quantidade": row[5]
        }
        for row in data
    ]

def get_status_report():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT status, COUNT(*) AS total_locacoes
        FROM locacoes
        GROUP BY status
    """)
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return [
        {"status": row[0], "total_locacoes": row[1]}
        for row in data
    ]
