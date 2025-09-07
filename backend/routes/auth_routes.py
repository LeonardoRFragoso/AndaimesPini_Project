from flask import Blueprint, request, jsonify, session
from models.usuario import Usuario
from helpers import handle_database_error
import sqlite3
import logging
import secrets
import functools

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Criação do blueprint para as rotas de autenticação
auth_routes = Blueprint('auth_routes', __name__, url_prefix='/auth')

# Função decoradora para verificar autenticação
def requer_autenticacao(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            logger.warning("Tentativa de acesso sem token de autenticação")
            return jsonify({"error": "Autenticação necessária"}), 401
        
        token = token.split(' ')[1]
        if token not in session_tokens:
            logger.warning("Token de autenticação inválido")
            return jsonify({"error": "Token inválido ou expirado"}), 401
        
        # Adiciona o usuário à requisição
        request.usuario = session_tokens[token]
        return f(*args, **kwargs)
    return decorated_function

# Função decoradora para verificar permissões de administrador
def requer_admin(f):
    @functools.wraps(f)
    @requer_autenticacao
    def decorated_function(*args, **kwargs):
        if request.usuario.get('cargo') != 'admin':
            logger.warning(f"Usuário {request.usuario.get('email')} tentou acessar recurso de administrador")
            return jsonify({"error": "Permissão negada"}), 403
        return f(*args, **kwargs)
    return decorated_function

# Dicionário para armazenar tokens de sessão (em produção, usar Redis ou similar)
session_tokens = {}

@auth_routes.route('/login', methods=['POST'])
def login():
    """Rota para autenticação de usuários."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        if not dados or 'email' not in dados or 'senha' not in dados:
            logger.warning("Tentativa de login com dados incompletos")
            return jsonify({"error": "Email e senha são obrigatórios"}), 400
        
        # Verificar credenciais
        usuario = Usuario.verificar_credenciais(dados['email'], dados['senha'])
        if not usuario:
            logger.warning(f"Tentativa de login falhou para o email: {dados.get('email')}")
            return jsonify({"error": "Credenciais inválidas"}), 401
        
        # Gerar token de sessão
        token = secrets.token_hex(32)
        session_tokens[token] = usuario
        
        logger.info(f"Login bem-sucedido para o usuário: {usuario['email']}")
        return jsonify({
            "message": "Login bem-sucedido",
            "token": token,
            "usuario": {
                "id": usuario['id'],
                "nome": usuario['nome'],
                "email": usuario['email'],
                "cargo": usuario['cargo']
            }
        }), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados durante login: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado durante login: {ex}")
        return jsonify({"error": "Erro ao processar login"}), 500

@auth_routes.route('/logout', methods=['POST'])
@requer_autenticacao
def logout():
    """Rota para encerrar a sessão do usuário."""
    try:
        token = request.headers.get('Authorization').split(' ')[1]
        if token in session_tokens:
            usuario = session_tokens[token]
            del session_tokens[token]
            logger.info(f"Logout bem-sucedido para o usuário: {usuario['email']}")
        
        return jsonify({"message": "Logout bem-sucedido"}), 200
    except Exception as ex:
        logger.error(f"Erro durante logout: {ex}")
        return jsonify({"error": "Erro ao processar logout"}), 500

@auth_routes.route('/verificar', methods=['GET'])
@requer_autenticacao
def verificar_token():
    """Rota para verificar se o token é válido."""
    return jsonify({
        "message": "Token válido",
        "usuario": {
            "id": request.usuario['id'],
            "nome": request.usuario['nome'],
            "email": request.usuario['email'],
            "cargo": request.usuario['cargo']
        }
    }), 200

@auth_routes.route('/usuarios', methods=['GET'])
@requer_admin
def listar_usuarios():
    """Rota para listar todos os usuários (apenas para administradores)."""
    try:
        usuarios = Usuario.listar_todos()
        return jsonify(usuarios), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao listar usuários: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao listar usuários: {ex}")
        return jsonify({"error": "Erro ao listar usuários"}), 500

@auth_routes.route('/usuarios', methods=['POST'])
@requer_admin
def criar_usuario():
    """Rota para criar um novo usuário (apenas para administradores)."""
    try:
        dados = request.get_json()
        
        # Validação dos campos obrigatórios
        campos_obrigatorios = ['nome', 'email', 'senha']
        for campo in campos_obrigatorios:
            if campo not in dados:
                logger.warning(f"Campo obrigatório ausente: {campo}")
                return jsonify({"error": f"O campo '{campo}' é obrigatório"}), 400
        
        # Criar usuário
        usuario_id = Usuario.criar_usuario(
            nome=dados['nome'],
            email=dados['email'],
            senha=dados['senha'],
            cargo=dados.get('cargo', 'operador')
        )
        
        if usuario_id is None:
            logger.error("Erro ao criar usuário")
            return jsonify({"error": "Erro ao criar usuário. O email pode já estar em uso."}), 400
        
        logger.info(f"Usuário criado com sucesso: ID {usuario_id}")
        return jsonify({"message": "Usuário criado com sucesso", "id": usuario_id}), 201
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao criar usuário: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao criar usuário: {ex}")
        return jsonify({"error": "Erro ao criar usuário"}), 500

@auth_routes.route('/usuarios/<int:usuario_id>', methods=['PUT'])
@requer_admin
def atualizar_usuario(usuario_id):
    """Rota para atualizar um usuário existente (apenas para administradores)."""
    try:
        dados = request.get_json()
        if not dados:
            logger.warning("Dados do usuário não fornecidos")
            return jsonify({"error": "Nenhum dado fornecido para atualização"}), 400
        
        # Atualizar usuário
        sucesso = Usuario.atualizar_usuario(
            usuario_id=usuario_id,
            nome=dados.get('nome'),
            email=dados.get('email'),
            senha=dados.get('senha'),
            cargo=dados.get('cargo')
        )
        
        if not sucesso:
            logger.warning(f"Erro ao atualizar usuário ID {usuario_id}")
            return jsonify({"error": "Erro ao atualizar usuário. Verifique se o ID é válido e se o email não está em uso."}), 400
        
        logger.info(f"Usuário ID {usuario_id} atualizado com sucesso")
        return jsonify({"message": "Usuário atualizado com sucesso"}), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao atualizar usuário: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao atualizar usuário: {ex}")
        return jsonify({"error": "Erro ao atualizar usuário"}), 500

@auth_routes.route('/usuarios/<int:usuario_id>', methods=['DELETE'])
@requer_admin
def excluir_usuario(usuario_id):
    """Rota para excluir um usuário (apenas para administradores)."""
    try:
        # Verificar se não está tentando excluir o próprio usuário
        if request.usuario['id'] == usuario_id:
            logger.warning(f"Usuário ID {usuario_id} tentou excluir a própria conta")
            return jsonify({"error": "Não é possível excluir sua própria conta"}), 400
        
        # Excluir usuário
        sucesso = Usuario.excluir_usuario(usuario_id)
        
        if not sucesso:
            logger.warning(f"Erro ao excluir usuário ID {usuario_id}")
            return jsonify({"error": "Erro ao excluir usuário. Verifique se o ID é válido."}), 400
        
        logger.info(f"Usuário ID {usuario_id} excluído com sucesso")
        return jsonify({"message": "Usuário excluído com sucesso"}), 200
    except sqlite3.Error as e:
        logger.error(f"Erro no banco de dados ao excluir usuário: {e}")
        return handle_database_error(e)
    except Exception as ex:
        logger.error(f"Erro inesperado ao excluir usuário: {ex}")
        return jsonify({"error": "Erro ao excluir usuário"}), 500
