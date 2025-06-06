

from flask import Blueprint, request, jsonify
from db import save_hardware_data

hardware_bp = Blueprint('hardware', __name__)

@hardware_bp.route('/api/hardware', methods=['POST'])
def post_hardware_data():
    content = request.get_json()

    machine_id = content.get('machine_id')
    cpu = content.get('cpu')
    ram = content.get('ram')
    hdd = content.get('hdd')

    if not machine_id:
        return jsonify({"error": "Missing machine_id"}), 400

    save_hardware_data(machine_id, {
        "cpu": cpu,
        "ram": ram,
        "hdd": hdd
    })

    return jsonify({"status": "saved"}), 200
