from models import Inventario

# Definir itens para adicionar
itens_para_adicionar = [
    ("1,0m", 50000, "andaimes"),
    ("1,5m", 50000, "andaimes"),
    ("2,0m", 50000, "andaimes"),
    ("3,0m", 50000, "escoras"),
    ("4,0m", 50000, "escoras"),
    ("Pranchão 1,2m", 50000, "pranchões"),
    ("Pranchão 1,7m", 50000, "pranchões"),
    ("Rodízio simples", 50000, "rodízios"),
    ("Madeira Grande", 50000, "madeiras"),
    ("3,5m", 50000, "escoras"),
]

# Adicionar itens ao inventário
for nome_item, quantidade, tipo_item in itens_para_adicionar:
    Inventario.create(nome_item, quantidade, tipo_item)
