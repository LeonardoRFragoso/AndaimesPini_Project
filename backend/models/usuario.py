import sqlite3
from database import get_connection, release_connection
import logging
import hashlib
import secrets
import string

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Usuario:
    @staticmethod
    def _hash_senha(senha, salt=None):
        """
        Cria um hash seguro para a senha usando SHA-256 e um salt.
        
        Parâmetros:
            senha (str): Senha em texto plano.
            salt (str, optional): Salt para o hash. Se None, um novo salt será gerado.
            
        Retorna:
            tuple: (hash_senha, salt)
        """
        if salt is None:
            # Gerar um salt aleatório
            caracteres = string.ascii_letters + string.digits
            salt = ''.join(secrets.choice(caracteres) for _ in range(16))
        
        # Combinar senha e salt, e criar o hash
        senha_salgada = (senha + salt).encode('utf-8')
        hash_senha = hashlib.sha256(senha_salgada).hexdigest()
        
        return hash_senha, salt

    @staticmethod
    def criar_usuario(nome, email, senha, cargo="operador"):
        """
        Cria um novo usuário no banco de dados.
        
        Parâmetros:
            nome (str): Nome do usuário.
            email (str): Email do usuário (usado como login).
            senha (str): Senha em texto plano.
            cargo (str): Cargo do usuário (padrão: "operador").
            
        Retorna:
            int: ID do usuário criado ou None em caso de erro.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    # Verificar se o email já está em uso
                    cursor.execute("SELECT id FROM usuarios WHERE email = ?", (email,))
                    if cursor.fetchone():
                        logger.warning(f"Email já cadastrado: {email}")
                        return None
                    
                    # Hash da senha
                    hash_senha, salt = Usuario._hash_senha(senha)
                    
                    # Inserir o usuário
                    cursor.execute("""
                        INSERT INTO usuarios (nome, email, hash_senha, salt, cargo)
                        VALUES (?, ?, ?, ?, ?)
                        RETURNING id
                    """, (nome, email, hash_senha, salt, cargo))
                    
                    usuario_id = cursor.fetchone()[0]
                    logger.info(f"Usuário criado com sucesso: ID {usuario_id}")
                    return usuario_id
        except Exception as e:
            logger.error(f"Erro ao criar usuário: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def verificar_credenciais(email, senha):
        """
        Verifica se as credenciais de login são válidas.
        
        Parâmetros:
            email (str): Email do usuário.
            senha (str): Senha em texto plano.
            
        Retorna:
            dict: Dados do usuário se as credenciais forem válidas, None caso contrário.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, nome, email, hash_senha, salt, cargo
                        FROM usuarios
                        WHERE email = ?
                    """, (email,))
                    
                    usuario = cursor.fetchone()
                    if not usuario:
                        logger.warning(f"Usuário não encontrado: {email}")
                        return None
                    
                    id, nome, email, hash_senha, salt, cargo = usuario
                    
                    # Verificar a senha
                    hash_verificacao, _ = Usuario._hash_senha(senha, salt)
                    if hash_verificacao != hash_senha:
                        logger.warning(f"Senha incorreta para o usuário: {email}")
                        return None
                    
                    logger.info(f"Login bem-sucedido: {email}")
                    return {
                        "id": id,
                        "nome": nome,
                        "email": email,
                        "cargo": cargo
                    }
        except Exception as e:
            logger.error(f"Erro ao verificar credenciais: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def obter_por_id(usuario_id):
        """
        Obtém os dados de um usuário pelo ID.
        
        Parâmetros:
            usuario_id (int): ID do usuário.
            
        Retorna:
            dict: Dados do usuário ou None se não encontrado.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, nome, email, cargo
                        FROM usuarios
                        WHERE id = ?
                    """, (usuario_id,))
                    
                    usuario = cursor.fetchone()
                    if not usuario:
                        logger.warning(f"Usuário ID {usuario_id} não encontrado.")
                        return None
                    
                    id, nome, email, cargo = usuario
                    
                    return {
                        "id": id,
                        "nome": nome,
                        "email": email,
                        "cargo": cargo
                    }
        except Exception as e:
            logger.error(f"Erro ao buscar usuário por ID: {e}")
            return None
        finally:
            release_connection(conn)

    @staticmethod
    def listar_todos():
        """
        Lista todos os usuários cadastrados.
        
        Retorna:
            list: Lista de dicionários com os dados dos usuários.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT id, nome, email, cargo
                        FROM usuarios
                    """)
                    
                    usuarios = cursor.fetchall()
                    return [
                        {
                            "id": u[0],
                            "nome": u[1],
                            "email": u[2],
                            "cargo": u[3]
                        }
                        for u in usuarios
                    ]
        except Exception as e:
            logger.error(f"Erro ao listar usuários: {e}")
            return []
        finally:
            release_connection(conn)

    @staticmethod
    def atualizar_usuario(usuario_id, nome=None, email=None, senha=None, cargo=None):
        """
        Atualiza os dados de um usuário.
        
        Parâmetros:
            usuario_id (int): ID do usuário.
            nome (str, optional): Novo nome.
            email (str, optional): Novo email.
            senha (str, optional): Nova senha.
            cargo (str, optional): Novo cargo.
            
        Retorna:
            bool: True se atualizado com sucesso, False caso contrário.
        """
        if not any([nome, email, senha, cargo]):
            logger.warning("Nenhum dado fornecido para atualização.")
            return False
        
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    # Verificar se o usuário existe
                    cursor.execute("SELECT id FROM usuarios WHERE id = ?", (usuario_id,))
                    if not cursor.fetchone():
                        logger.warning(f"Usuário ID {usuario_id} não encontrado.")
                        return False
                    
                    # Verificar se o novo email já está em uso
                    if email:
                        cursor.execute("SELECT id FROM usuarios WHERE email = ? AND id != ?", (email, usuario_id))
                        if cursor.fetchone():
                            logger.warning(f"Email já cadastrado: {email}")
                            return False
                    
                    # Construir a query de atualização
                    campos = []
                    valores = []
                    
                    if nome:
                        campos.append("nome = ?")
                        valores.append(nome)
                    
                    if email:
                        campos.append("email = ?")
                        valores.append(email)
                    
                    if senha:
                        hash_senha, salt = Usuario._hash_senha(senha)
                        campos.append("hash_senha = ?")
                        valores.append(hash_senha)
                        campos.append("salt = ?")
                        valores.append(salt)
                    
                    if cargo:
                        campos.append("cargo = ?")
                        valores.append(cargo)
                    
                    # Adicionar o ID ao final dos valores
                    valores.append(usuario_id)
                    
                    # Executar a query
                    query = f"UPDATE usuarios SET {', '.join(campos)} WHERE id = ?"
                    cursor.execute(query, valores)
                    
                    if cursor.rowcount > 0:
                        logger.info(f"Usuário ID {usuario_id} atualizado com sucesso.")
                        return True
                    else:
                        logger.warning(f"Nenhuma alteração feita para o usuário ID {usuario_id}.")
                        return False
        except Exception as e:
            logger.error(f"Erro ao atualizar usuário: {e}")
            return False
        finally:
            release_connection(conn)

    @staticmethod
    def excluir_usuario(usuario_id):
        """
        Exclui um usuário do banco de dados.
        
        Parâmetros:
            usuario_id (int): ID do usuário.
            
        Retorna:
            bool: True se excluído com sucesso, False caso contrário.
        """
        conn = get_connection()
        try:
            with conn:
                with conn.cursor() as cursor:
                    cursor.execute("DELETE FROM usuarios WHERE id = ?", (usuario_id,))
                    
                    if cursor.rowcount > 0:
                        logger.info(f"Usuário ID {usuario_id} excluído com sucesso.")
                        return True
                    else:
                        logger.warning(f"Usuário ID {usuario_id} não encontrado para exclusão.")
                        return False
        except Exception as e:
            logger.error(f"Erro ao excluir usuário: {e}")
            return False
        finally:
            release_connection(conn)
