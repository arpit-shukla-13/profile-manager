from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

# --- CONFIGURATION ---
app.config["MONGO_URI"] = "mongodb+srv://profile-manager:profile-manager@mysecuresharecluster.2cdw072.mongodb.net/profileDB?appName=MySecureShareCluster"
app.config["JWT_SECRET_KEY"] = "12345" 

mongo = PyMongo(app)
CORS(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- ROUTE 1: SIGNUP ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    # Email ko hamesha lowercase (chota) rakhein taaki case ka chakkar na ho
    email = data.get('email', '').lower()
    password = data.get('password')
    photo = data.get('photo')

    if not name or not email or not password:
        return jsonify({'error': 'Saare fields bharna zaroori hai'}), 400

    if mongo.db.users.find_one({'email': email}):
        return jsonify({'error': 'Email pehle se registered hai'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    mongo.db.users.insert_one({
        'name': name, 
        'email': email, 
        'password': hashed_password,
        'photo': photo
    })

    return jsonify({'message': 'Account ban gaya! Ab login karein.'}), 201

# --- ROUTE 2: LOGIN (DEBUGGING ADDED) ---
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower() # Yahan bhi lowercase
    password = data.get('password')

    # Debugging Print: Terminal mein dekhein ki kya data aa raha hai
    print(f"\n--- LOGIN ATTEMPT ---")
    print(f"Email received: {email}")
    print(f"Password received: {password}")

    user = mongo.db.users.find_one({'email': email})

    if user:
        print("User found in Database ✅")
        # Password check
        if bcrypt.check_password_hash(user['password'], password):
            print("Password Matched ✅")
            access_token = create_access_token(identity=str(user['_id']))
            return jsonify({'token': access_token, 'name': user['name']}), 200
        else:
            print("Password Wrong ❌")
    else:
        print("User NOT found ❌")
    
    return jsonify({'error': 'Email ya Password galat hai'}), 401

# --- ROUTE 3: DASHBOARD ---
@app.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    user = mongo.db.users.find_one({'_id': ObjectId(current_user_id)})
    
    if user:
        return jsonify({
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'photo': user.get('photo', '')
        })
    return jsonify({'error': 'User not found'}), 404

# --- ROUTE 4: UPDATE ---
@app.route('/update', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    data = request.json
    
    update_data = {
        'name': data.get('name'),
        'photo': data.get('photo')
    }
    
    mongo.db.users.update_one({'_id': ObjectId(current_user_id)}, {'$set': update_data})
    return jsonify({'message': 'Profile Updated Successfully'})

# --- ROUTE 5: DELETE ---
@app.route('/delete', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user_id = get_jwt_identity()
    mongo.db.users.delete_one({'_id': ObjectId(current_user_id)})
    return jsonify({'message': 'Account Deleted'})

if __name__ == '__main__':
    app.run(debug=True)