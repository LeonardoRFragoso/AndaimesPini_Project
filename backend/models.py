import psycopg2
from database import create_connection

# Classe para lidar com operações relacionadas aos Clientes
class Cliente:
    @staticmethod
    def create(nome, endereco, telefone, referencia):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO clientes (nome, endereco, telefone, referencia)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (nome, endereco, telefone, referencia))
            cliente_id = cursor.fetchone()[0]
            conn.commit()
            return cliente_id
        except psycopg2.Error as e:
            conn.rollback()  # Rollback para garantir a integridade do banco
            print(f"Erro ao adicionar cliente: {e}")
            return None
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM clientes')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar clientes: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_id(cliente_id):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM clientes WHERE id = %s', (cliente_id,))
            return cursor.fetchone()
        except psycopg2.Error as e:
            print(f"Erro ao buscar cliente por ID: {e}")
            return None
        finally:
            cursor.close()
            conn.close()

# Classe para lidar com operações relacionadas ao Inventário
class Inventario:
    @staticmethod
    def get_item_id_by_modelo(modelo_item):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM inventario WHERE nome_item = %s', (modelo_item,))
            item_id = cursor.fetchone()
            
            if item_id:
                return item_id[0]
            else:
                print(f"Item não encontrado no inventário: {modelo_item}")
                return None
        except psycopg2.Error as e:
            print(f"Erro ao buscar item por modelo: {e}")
            return None
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM inventario')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar inventário: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def update_quantidade(item_id, quantidade):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE inventario SET quantidade = quantidade - %s WHERE id = %s
            ''', (quantidade, item_id))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()  # Rollback para garantir a integridade do banco
            print(f"Erro ao atualizar quantidade do item no inventário: {e}")
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def validar_estoque(item_id, quantidade):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT quantidade FROM inventario WHERE id = %s', (item_id,))
            estoque_atual = cursor.fetchone()
            return estoque_atual and estoque_atual[0] >= quantidade
        except psycopg2.Error as e:
            print(f"Erro ao validar estoque: {e}")
            return False
        finally:
            cursor.close()
            conn.close()

# Classe para lidar com operações relacionadas às Locações
class Locacao:
    @staticmethod
    def create(cliente_id, data_inicio, data_fim, valor_total):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO locacoes (cliente_id, data_inicio, data_fim, valor_total)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            ''', (cliente_id, data_inicio, data_fim, valor_total))
            locacao_id = cursor.fetchone()[0]
            conn.commit()
            return locacao_id
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar locação: {e}")
            return None
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        try:
            conn = create_connection()
            cursor = conn.cursor()
            query = '''
                SELECT locacoes.id, clientes.nome, clientes.endereco, clientes.telefone, locacoes.data_inicio, locacoes.data_fim, locacoes.valor_total
                FROM locacoes
                JOIN clientes ON locacoes.cliente_id = clientes.id
            '''
            cursor.execute(query)
            locacoes = cursor.fetchall()

            # Agora buscamos os itens locados para cada locação
            locacoes_completas = []
            for locacao in locacoes:
                locacao_id = locacao[0]
                itens_locados = ItensLocados.get_by_locacao(locacao_id)
                locacoes_completas.append({
                    "numero_nota": locacao_id,
                    "nome_cliente": locacao[1],
                    "endereco": locacao[2],
                    "telefone": locacao[3],
                    "data_inicio": locacao[4],
                    "data_fim": locacao[5],
                    "valor_total": locacao[6],
                    "itens": itens_locados
                })

            return locacoes_completas
        except psycopg2.Error as e:
            print(f"Erro ao buscar locações: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_id(locacao_id):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM locacoes WHERE id = %s', (locacao_id,))
            return cursor.fetchone()
        except psycopg2.Error as e:
            print(f"Erro ao buscar locação por ID: {e}")
            return None
        finally:
            cursor.close()
            conn.close()

# Classe para lidar com operações relacionadas aos Itens Locados
class ItensLocados:
    @staticmethod
    def add_item(locacao_id, item_id, quantidade):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO itens_locados (locacao_id, item_id, quantidade)
                VALUES (%s, %s, %s)
            ''', (locacao_id, item_id, quantidade))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao adicionar item locado: {e}")
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_locacao(locacao_id):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            query = '''
                SELECT inventario.nome_item, itens_locados.quantidade
                FROM itens_locados
                JOIN inventario ON itens_locados.item_id = inventario.id
                WHERE itens_locados.locacao_id = %s
            '''
            cursor.execute(query, (locacao_id,))
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar itens locados: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

# Classe para lidar com operações relacionadas ao Registro de Danos
class RegistroDanos:
    @staticmethod
    def add_dano(locacao_id, item_id, quantidade_danificada):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO registro_danos (locacao_id, item_id, quantidade_danificada)
                VALUES (%s, %s, %s)
            ''', (locacao_id, item_id, quantidade_danificada))
            conn.commit()
        except psycopg2.Error as e:
            conn.rollback()
            print(f"Erro ao registrar dano: {e}")
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_by_locacao(locacao_id):
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM registro_danos WHERE locacao_id = %s', (locacao_id,))
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar danos por locação: {e}")
            return []
        finally:
            cursor.close()
            conn.close()

    @staticmethod
    def get_all():
        try:
            conn = create_connection()
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM registro_danos')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Erro ao buscar todos os registros de danos: {e}")
            return []
        finally:
            cursor.close()
            conn.close()
