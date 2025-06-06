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
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Atenție: Firebase Authentication nu oferă endpoint direct de login
    # în admin SDK; pentru login folosește clientul Firebase din frontend.
    # Totuși, aici poți verifica existența userului și returna rolul.

    try:
        # Caută user după email
        users_ref = db.collection('users').where('email', '==', email).stream()
        user_doc = next(users_ref, None)
        if user_doc is None:
            return jsonify({'error': 'Utilizator inexistent'}), 404
        user_data = user_doc.to_dict()

        # Parola trebuie verificată pe client (frontend) cu Firebase Auth,
        # deci aici doar returnezi rolul și machine_id
        return jsonify({
            'email': email,
            'role': user_data.get('role'),
            'machine_id': user_data.get('machine_id')
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400



if __name__ == '__main__':
     port = int(os.environ.get('PORT', 5000)) 
     app.run(host='0.0.0.0', port=port, debug=True)
