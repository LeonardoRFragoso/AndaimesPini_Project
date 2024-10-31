from flask import Blueprint, request, jsonify, send_file
from models.report import (
    obter_dados_resumo,       # Função para obter dados de visão geral
    obter_relatorio_por_id,   # Função para obter relatório por ID
    get_overview_data,        # Função para obter dados de visão geral com filtros
    get_client_report,        # Função para relatório detalhado de locações de um cliente
    get_inventory_usage,      # Função para obter uso do inventário
    get_status_report         # Função para obter dados de status e gráficos
)
from io import BytesIO  # Para o tratamento de gráficos

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")

# Endpoint de visão geral com indicadores principais e filtros de data
@reports_bp.route("/overview", methods=["GET"])
def overview_report():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    data = get_overview_data(start_date, end_date)  # Ajustado para usar get_overview_data com filtros

    if "error" in data:
        return jsonify(data), 400

    return jsonify(data), 200

# Endpoint de relatório de locações para um cliente específico
@reports_bp.route("/client/<int:cliente_id>", methods=["GET"])
def client_report(cliente_id):
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    data = get_client_report(cliente_id, start_date, end_date)

    if "error" in data:
        return jsonify(data), 400

    return jsonify(data), 200

# Endpoint de uso do inventário para um item específico
@reports_bp.route("/inventory/<int:item_id>", methods=["GET"])
def inventory_usage(item_id):
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    data = get_inventory_usage(item_id, start_date, end_date)

    if "error" in data:
        return jsonify(data), 400

    return jsonify(data), 200

# Endpoint de relatório de status com opções de exportação
@reports_bp.route("/status", methods=["GET"])
def status_report():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    export_format = request.args.get("export_format")

    data = get_status_report(start_date, end_date)  # Chamada ajustada para filtros de data

    # Verifica por erros antes de responder
    if "error" in data:
        return jsonify(data), 400

    # Retorna arquivo Excel para download
    if export_format == "excel":
        output, filename = export_report_to_excel(data)
        return send_file(output, as_attachment=True, download_name=filename, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    # Retorna gráfico gerado
    if export_format == "chart":
        chart_output = generate_summary_chart(data)
        return send_file(chart_output, mimetype="image/png")

    # Retorna dados em JSON como resposta padrão
    return jsonify(data), 200

# Endpoint para obter um relatório específico pelo ID
@reports_bp.route("/report/<int:relatorio_id>", methods=["GET"])
def report_by_id(relatorio_id):
    data = obter_relatorio_por_id(relatorio_id)

    if "error" in data:
        return jsonify(data), 400

    return jsonify(data), 200
