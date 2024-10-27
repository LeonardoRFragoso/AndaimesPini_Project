from flask import Blueprint
from .clientes_routes import clientes_routes
from .inventario_routes import inventario_routes
from .locacoes_routes import locacoes_routes
from .danos_routes import danos_routes  # Use o nome correto aqui

# Blueprint principal para a aplicação
routes = Blueprint('main', __name__)

# Registro dos blueprints de cada módulo
def init_app(app):
    app.register_blueprint(clientes_routes, url_prefix='/clientes')
    app.register_blueprint(inventario_routes, url_prefix='/inventario')
    app.register_blueprint(locacoes_routes, url_prefix='/locacoes')
    app.register_blueprint(danos_routes, url_prefix='/danos')

# Chame esta função no app.py para inicializar as rotas
