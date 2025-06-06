import os
import firebase_admin
from firebase_admin import auth
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://hardware-app-70d57.web.app", "https://hardware-app-70d57.firebaseapp.com"])

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/hardware', methods=['POST'])
def save_hardware_data():
    data = request.json
    machine_id = data.get('machine_id')

    if not machine_id:
        return jsonify({'error': 'machine_id is required'}), 400

    db.collection('hardware').document(machine_id).set(data)
    return jsonify({'status': 'saved'}), 200

@app.route('/api/hardware', methods=['GET'])
def get_hardware_data():
    docs = db.collection('hardware').stream()
    results = [doc.to_dict() for doc in docs]
    return jsonify(results)

@app.route('/api/hardware/details', methods=['GET'])
def get_all_hardware_details():
    docs = db.collection('hardware').stream()
    results = [doc.to_dict() for doc in docs]
    return jsonify(results)

@app.route('/api/hardware/details/<machine_id>', methods=['GET'])
def get_hardware_detail(machine_id):
    doc_ref = db.collection('hardware').document(machine_id)
    doc = doc_ref.get()
    if doc.exists:
        return jsonify(doc.to_dict())
    else:
        return jsonify({'error': 'Machine not found'}), 404

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')  # default client
    machine_id = data.get('machine_id')

    if not email or not password:
        return jsonify({'error': 'Email și parolă sunt necesare'}), 400

    try:
        user_record = auth.create_user(email=email, password=password)
        # Salvează rolul și machine_id în Firestore
        db.collection('users').document(user_record.uid).set({
            'email': email,
            'role': role,
            'machine_id': machine_id
        })
        return jsonify({'message': 'User creat cu succes'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login_user():
    auth_header = request.headers.get('Authorization', None)
    if not auth_header:
        return jsonify({'error': 'Missing Authorization header'}), 401

    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return jsonify({'error': 'Invalid Authorization header format'}), 401

    token = parts[1]

    try:
        # Verifică tokenul JWT primit de la frontend
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Ia datele utilizatorului din Firestore după uid
        user_doc = db.collection('users').document(uid).get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict()

        # Returnează datele utile
        return jsonify({
            'email': user_data.get('email'),
            'role': user_data.get('role'),
            'machine_id': user_data.get('machine_id')
        })

    except Exception as e:
        # Dacă tokenul nu e valid sau altă eroare
        return jsonify({'error': str(e)}), 401

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
