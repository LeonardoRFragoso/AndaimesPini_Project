#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Script para verificar e corrigir os dados de inventário e itens locados.
"""

import sqlite3
import os
import logging
from datetime import date

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_db_path():
    """Retorna o caminho para o arquivo do banco de dados SQLite."""
    # Caminho base do projeto
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Caminho para o banco de dados
    db_path = os.path.join(base_dir, 'database', 'db.sqlite3')
    return db_path

def check_and_fix_inventory():
    """Verifica e corrige os dados de inventário com base nos itens locados."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        logger.error(f"Banco de dados não encontrado em: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Obter todos os itens do inventário
        cursor.execute("""
            SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item
            FROM inventario
        """)
        inventory_items = cursor.fetchall()
        logger.info(f"Total de itens no inventário: {len(inventory_items)}")
        
        # 2. Obter todos os itens locados ativos (sem data_devolucao)
        cursor.execute("""
            SELECT il.item_id, SUM(il.quantidade) as total_locado
            FROM itens_locados il
            LEFT JOIN locacoes l ON il.locacao_id = l.id
            WHERE il.data_devolucao IS NULL AND l.status != 'concluido'
            GROUP BY il.item_id
        """)
        rented_items = {item[0]: item[1] for item in cursor.fetchall()}
        logger.info(f"Itens atualmente locados: {len(rented_items)}")
        
        # 3. Verificar e corrigir discrepâncias
        updates_needed = []
        for item in inventory_items:
            item_id, nome_item, quantidade, quantidade_disponivel, tipo_item = item
            
            # Calcular quanto deveria estar disponível
            total_rented = rented_items.get(item_id, 0)
            expected_available = quantidade - total_rented
            
            if quantidade_disponivel != expected_available:
                logger.warning(f"Discrepância encontrada para item {nome_item} (ID: {item_id}):")
                logger.warning(f"  - Quantidade total: {quantidade}")
                logger.warning(f"  - Quantidade locada: {total_rented}")
                logger.warning(f"  - Disponível esperado: {expected_available}")
                logger.warning(f"  - Disponível atual: {quantidade_disponivel}")
                
                updates_needed.append((expected_available, item_id))
        
        # 4. Aplicar correções se necessário
        if updates_needed:
            logger.info(f"Corrigindo {len(updates_needed)} itens com discrepâncias...")
            for update in updates_needed:
                expected_available, item_id = update
                cursor.execute("""
                    UPDATE inventario
                    SET quantidade_disponivel = ?
                    WHERE id = ?
                """, (expected_available, item_id))
            
            conn.commit()
            logger.info("Correções aplicadas com sucesso!")
            return True
        else:
            logger.info("Nenhuma discrepância encontrada no inventário.")
            return False
            
    except sqlite3.Error as e:
        logger.error(f"Erro ao verificar/corrigir inventário: {e}")
        return False
    finally:
        if conn:
            conn.close()

def display_inventory_status():
    """Exibe o status atual do inventário e itens locados."""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        logger.error(f"Banco de dados não encontrado em: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Exibir itens do inventário
        cursor.execute("""
            SELECT id, nome_item, quantidade, quantidade_disponivel, tipo_item
            FROM inventario
            ORDER BY nome_item
        """)
        inventory_items = cursor.fetchall()
        
        print("\n===== STATUS DO INVENTÁRIO =====")
        print(f"{'ID':<5} {'Nome':<30} {'Total':<10} {'Disponível':<10} {'Tipo':<15}")
        print("-" * 70)
        
        for item in inventory_items:
            item_id, nome_item, quantidade, quantidade_disponivel, tipo_item = item
            print(f"{item_id:<5} {nome_item:<30} {quantidade:<10} {quantidade_disponivel:<10} {tipo_item:<15}")
        
        # Exibir locações ativas
        cursor.execute("""
            SELECT l.id, c.nome, l.data_inicio, l.data_fim, l.status
            FROM locacoes l
            JOIN clientes c ON l.cliente_id = c.id
            WHERE l.status != 'concluido'
            ORDER BY l.data_inicio DESC
        """)
        active_rentals = cursor.fetchall()
        
        print("\n\n===== LOCAÇÕES ATIVAS =====")
        print(f"{'ID':<5} {'Cliente':<30} {'Início':<12} {'Fim':<12} {'Status':<10}")
        print("-" * 70)
        
        for rental in active_rentals:
            rental_id, cliente, data_inicio, data_fim, status = rental
            print(f"{rental_id:<5} {cliente:<30} {data_inicio:<12} {data_fim:<12} {status:<10}")
            
            # Exibir itens desta locação
            cursor.execute("""
                SELECT i.nome_item, il.quantidade, il.data_alocacao, il.data_devolucao
                FROM itens_locados il
                JOIN inventario i ON il.item_id = i.id
                WHERE il.locacao_id = ?
            """, (rental_id,))
            
            rental_items = cursor.fetchall()
            print(f"  {'Item':<30} {'Qtd':<5} {'Alocado':<12} {'Devolvido':<12}")
            print("  " + "-" * 60)
            
            for rental_item in rental_items:
                item_nome, qtd, data_alocacao, data_devolucao = rental_item
                data_devolucao = data_devolucao if data_devolucao else "Pendente"
                print(f"  {item_nome:<30} {qtd:<5} {data_alocacao:<12} {data_devolucao:<12}")
            
            print("\n")
            
    except sqlite3.Error as e:
        logger.error(f"Erro ao exibir status do inventário: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Verificando e corrigindo dados do inventário...")
    fixed = check_and_fix_inventory()
    
    if fixed:
        print("Foram encontradas e corrigidas discrepâncias no inventário.")
    else:
        print("Nenhuma correção foi necessária ou ocorreu um erro.")
    
    display_inventory_status()
