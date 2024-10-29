from flask import Blueprint, request, jsonify, send_file
from models.report import (
    get_overview_data,
    get_client_report,
    get_inventory_usage,
    get_status_report
)
import csv
import io

reports_routes = Blueprint('reports_routes', __name__)

@reports_routes.route('/reports/overview', methods=['GET'])
def overview_report():
    data = get_overview_data()
    return jsonify(data)

@reports_routes.route('/reports/by-client', methods=['GET'])
def report_by_client():
    cliente_id = request.args.get('cliente_id')
    data = get_client_report(cliente_id)
    return jsonify(data)

@reports_routes.route('/reports/by-item', methods=['GET'])
def report_by_item():
    item_id = request.args.get('item_id')
    data = get_inventory_usage(item_id)
    return jsonify(data)

@reports_routes.route('/reports/by-status', methods=['GET'])
def report_by_status():
    data = get_status_report()
    return jsonify(data)

@reports_routes.route('/reports/download', methods=['POST'])
def download_report():
    report_data = request.json.get('report_data')
    csv_output = io.StringIO()
    csv_writer = csv.writer(csv_output)
    
    # Define columns
    csv_writer.writerow(report_data[0].keys())
    
    # Write rows
    for row in report_data:
        csv_writer.writerow(row.values())
    
    csv_output.seek(0)
    return send_file(
        io.BytesIO(csv_output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name="report.csv"
    )
