import sqlite3
import os
import logging
from database import get_connection, release_connection

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def criar_tabela_notificacoes():
    """
    Cria a tabela de notificações no banco de dados se ela não existir.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Verificar se a tabela já existe
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='notificacoes'")
        if cursor.fetchone():
            logger.info("A tabela de notificações já existe.")
            return False
        
        # Criar a tabela de notificações
        cursor.execute('''
            CREATE TABLE notificacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                titulo TEXT NOT NULL,
                mensagem TEXT NOT NULL,
                data_criacao TEXT NOT NULL,
                lida INTEGER DEFAULT 0,
                relacionado_id INTEGER
            )
        ''')
        
        conn.commit()
        logger.info("Tabela de notificações criada com sucesso.")
        return True
    except Exception as e:
        logger.error(f"Erro ao criar tabela de notificações: {e}")
        return False
    finally:
        release_connection(conn)

def adicionar_notificacoes_iniciais():
    """
    Adiciona algumas notificações iniciais para teste.
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Adicionar notificações de exemplo
        notificacoes = [
            ('estoque_critico', 'Estoque Crítico: Andaime Fachadeiro', 
             'O item Andaime Fachadeiro está com estoque crítico. Apenas 5% disponível (2 de 40 unidades).', 
             '2025-09-07 10:00:00', 0, 1),
            
            ('devolucao_atrasada', 'Devolução Atrasada: Construtora Silva', 
             'A devolução do cliente Construtora Silva está atrasada. Data prevista: 2025-09-05.', 
             '2025-09-07 10:15:00', 0, 2),
             
            ('sistema', 'Bem-vindo ao Sistema de Notificações', 
             'O sistema de notificações foi implementado com sucesso. Agora você receberá alertas sobre estoque crítico e devoluções atrasadas.', 
             '2025-09-07 09:00:00', 0, None)
        ]
        
        cursor.executemany('''
            INSERT INTO notificacoes (tipo, titulo, mensagem, data_criacao, lida, relacionado_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', notificacoes)
        
        conn.commit()
        logger.info(f"Adicionadas {len(notificacoes)} notificações iniciais.")
        return True
    except Exception as e:
        logger.error(f"Erro ao adicionar notificações iniciais: {e}")
        return False
    finally:
        release_connection(conn)

if __name__ == "__main__":
    if criar_tabela_notificacoes():
        adicionar_notificacoes_iniciais()
    print("Processo concluído.")
