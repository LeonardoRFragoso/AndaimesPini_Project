from flask import Blueprint
from .rotas_clientes import clientes_routes  # Importando corretamente o arquivo rotas_clientes.py
from .damages_routes import damages_routes
from .inventario_routes import inventario_routes
from .rotas_locacoes import locacoes_routes  # Importando corretamente o arquivo rotas_locacoes.py
from .reports_routes import reports_bp  # Importando corretamente o Blueprint de relatórios
from .rotas_itens_locados import itens_locados_routes  # Importando corretamente o arquivo rotas_itens_locados.py
from .notificacoes_routes import notificacoes_routes  # Importando as rotas de notificações

# Criação do Blueprint principal
main_routes = Blueprint('main_routes', __name__)

# Registro de Blueprints com os prefixos corretos
main_routes.register_blueprint(clientes_routes, url_prefix='/clientes')
main_routes.register_blueprint(damages_routes, url_prefix='/danos')
main_routes.register_blueprint(inventario_routes, url_prefix='/inventario')
main_routes.register_blueprint(locacoes_routes, url_prefix='/locacoes')
main_routes.register_blueprint(itens_locados_routes, url_prefix='/itens-locados')
main_routes.register_blueprint(reports_bp, url_prefix='/relatorios')  # Ajuste no nome do Blueprint de relatórios
main_routes.register_blueprint(notificacoes_routes, url_prefix='/notificacoes')
