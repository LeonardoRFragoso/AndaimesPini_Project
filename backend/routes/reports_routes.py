from flask import Blueprint, request, jsonify, send_file
from models.report import Relatorios
from io import BytesIO

reports_bp = Blueprint("reports", __name__, url_prefix="/reports")

# Endpoint de visão geral com indicadores principais e filtros de data
@reports_bp.route("/overview", methods=["GET"])
def overview_report():
    """
    Retorna um resumo geral das locações, com suporte a filtros de data.
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    try:
        print(f"[DEBUG] Overview endpoint called with start_date={start_date}, end_date={end_date}")
        data = Relatorios.obter_dados_resumo_com_filtros(start_date, end_date)
        print(f"[DEBUG] Data returned: {data}")

        if isinstance(data, dict) and "error" in data:
            print(f"[DEBUG] Error in data: {data}")
            return jsonify(data), 400

        print(f"[DEBUG] Returning successful response")
        print(f"[DEBUG] JSON response will be: {jsonify(data).get_json()}")
        return jsonify(data), 200
    except Exception as ex:
        print(f"[DEBUG] Exception caught: {str(ex)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro ao gerar relatório de visão geral: {str(ex)}"}), 500

# Endpoint de relatório detalhado de locações de um cliente específico
@reports_bp.route("/client/<int:cliente_id>", methods=["GET"])
def client_report(cliente_id):
    """
    Retorna um relatório detalhado de locações associadas a um cliente.
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    try:
        data = Relatorios.obter_relatorio_cliente(cliente_id, start_date, end_date)

        if "error" in data:
            return jsonify(data), 400

        return jsonify(data), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao gerar relatório do cliente: {str(ex)}"}), 500

# Endpoint de uso do inventário para um item específico
@reports_bp.route("/inventory/<int:item_id>", methods=["GET"])
def inventory_usage(item_id):
    """
    Retorna o uso de um item do inventário em todas as locações.
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    try:
        data = Relatorios.obter_uso_inventario(item_id, start_date, end_date)

        if "error" in data:
            return jsonify(data), 400

        return jsonify(data), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao gerar uso do inventário: {str(ex)}"}), 500

# Endpoint de relatório de status com opções de exportação
@reports_bp.route("/status", methods=["GET"])
def status_report():
    """
    Retorna o status das locações, podendo ser exportado como Excel ou gráfico.
    """
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    export_format = request.args.get("export_format")

    try:
        data = Relatorios.obter_relatorio_status(start_date, end_date)

        if "error" in data:
            return jsonify(data), 400

        # Retorna arquivo Excel para download
        if export_format == "excel":
            # Função export_report_to_excel não está definida
            return jsonify({"error": "Exportação para Excel não implementada"}), 501

        # Retorna gráfico gerado
        if export_format == "chart":
            # Função generate_summary_chart não está definida
            return jsonify({"error": "Geração de gráfico não implementada"}), 501

        # Retorna dados em JSON como resposta padrão
        return jsonify(data), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao gerar relatório de status: {str(ex)}"}), 500

# Endpoint para obter um relatório específico pelo ID
@reports_bp.route("/report/<int:relatorio_id>", methods=["GET"])
def report_by_id(relatorio_id):
    """
    Retorna os detalhes de um relatório específico pelo ID.
    """
    try:
        data = Relatorios.obter_relatorio_por_id(relatorio_id)

        if "error" in data:
            return jsonify(data), 400

        return jsonify(data), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao obter relatório pelo ID: {str(ex)}"}), 500

# Endpoint para buscar clientes (para autocomplete/filtros)
@reports_bp.route("/clients", methods=["GET"])
def search_clients():
    """
    Retorna lista de clientes para filtros e buscas.
    """
    from models.cliente import Cliente
    try:
        search_term = request.args.get("search", "")
        clientes = Cliente.get_all()
        
        # Filtrar por termo de busca se fornecido
        if search_term:
            clientes = [c for c in clientes if search_term.lower() in c.get('nome', '').lower()]
        
        return jsonify(clientes), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao buscar clientes: {str(ex)}"}), 500

# Endpoint para buscar itens do inventário (para autocomplete/filtros)
@reports_bp.route("/items", methods=["GET"])
def search_items():
    """
    Retorna lista de itens do inventário para filtros e buscas.
    """
    from models.inventario import Inventario
    try:
        search_term = request.args.get("search", "")
        itens = Inventario.get_all()
        
        # Filtrar por termo de busca se fornecido
        if search_term:
            itens = [i for i in itens if search_term.lower() in i.get('nome_item', '').lower()]
        
        return jsonify(itens), 200
    except Exception as ex:
        return jsonify({"error": f"Erro ao buscar itens: {str(ex)}"}), 500

# Endpoint para download de relatórios em CSV
@reports_bp.route("/download", methods=["POST"])
def download_report():
    """
    Gera e retorna um arquivo CSV com os dados do relatório.
    """
    import csv
    from io import StringIO
    try:
        dados = request.get_json()
        report_data = dados.get('report_data', [])
        
        if not report_data:
            return jsonify({"error": "Nenhum dado fornecido para download."}), 400
        
        # Criar CSV em memória
        output = StringIO()
        if len(report_data) > 0:
            writer = csv.DictWriter(output, fieldnames=report_data[0].keys())
            writer.writeheader()
            writer.writerows(report_data)
        
        # Converter para bytes
        csv_data = output.getvalue().encode('utf-8-sig')
        
        return send_file(
            BytesIO(csv_data),
            mimetype='text/csv',
            as_attachment=True,
            download_name='relatorio.csv'
        )
    except Exception as ex:
        return jsonify({"error": f"Erro ao gerar download: {str(ex)}"}), 500
