from flask import Flask, request
from tf_keras.models import model_from_json
import tensorflow as tf
from flask_cors import CORS
import numpy as np
import cv2
import base64
import sqlite3
import secrets
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
cors = CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
)
app.config['CORS_HEADERS'] = 'Content-Type'
DB_PATH = "users.db"

with open('model.json', 'r', encoding='utf-8') as json_file:
    loaded_model_json = json_file.read()
loaded_model = model_from_json(loaded_model_json)
loaded_model.load_weights("model.h5")
grad_cam_model = tf.keras.models.Model(
    [loaded_model.inputs],
    [loaded_model.get_layer("block5_conv3").output, loaded_model.output],
)


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    )
    conn.commit()
    conn.close()


def extract_token():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None


def get_current_user():
    token = extract_token()
    if not token:
        return None

    conn = get_db_connection()
    user = conn.execute(
        """
        SELECT u.id, u.full_name, u.email
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
        """,
        (token,),
    ).fetchone()
    conn.close()
    return user


def get_cv2_image_from_base64_string(b64str):
    try:
        encoded_data = b64str.split(',', 1)[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


def get_localization_box(image_array):
    """Return a relative bounding box from Grad-CAM heatmap."""
    try:
        input_tensor = np.expand_dims(image_array.astype("float32"), axis=0)
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_cam_model(input_tensor)
            class_idx = tf.argmax(predictions[0])
            class_channel = predictions[:, class_idx]

        grads = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
        heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-8)
        heatmap = heatmap.numpy()
        heatmap = cv2.resize(heatmap, (224, 224))

        mask = (heatmap > 0.55).astype("uint8") * 255
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return None

        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        if w < 8 or h < 8:
            return None

        return {
            "x": round(x / 224, 4),
            "y": round(y / 224, 4),
            "w": round(w / 224, 4),
            "h": round(h / 224, 4),
        }
    except Exception:
        return None


@app.route('/home',methods=['GET'])
def home():
    return {"status": "ok"}


@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}
    full_name = (data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if len(full_name) < 2:
        return {"error": "Full name must be at least 2 characters"}, 400
    if "@" not in email or "." not in email:
        return {"error": "Please provide a valid email"}, 400
    if len(password) < 6:
        return {"error": "Password must be at least 6 characters"}, 400

    conn = get_db_connection()
    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    if existing_user:
        conn.close()
        return {"error": "Email already registered"}, 409

    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO users (full_name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (full_name, email, password_hash, created_at),
    )
    user_id = cursor.lastrowid
    token = secrets.token_hex(32)
    cursor.execute(
        """
        INSERT INTO sessions (token, user_id, created_at)
        VALUES (?, ?, ?)
        """,
        (token, user_id, created_at),
    )
    conn.commit()
    conn.close()

    return {
        "message": "Signup successful",
        "token": token,
        "user": {"id": user_id, "fullName": full_name, "email": email},
    }, 201


@app.route('/auth/signin', methods=['POST'])
def signin():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, full_name, email, password_hash FROM users WHERE email = ?",
        (email,),
    ).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        conn.close()
        return {"error": "Invalid email or password"}, 401

    token = secrets.token_hex(32)
    conn.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user["id"], datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()

    return {
        "message": "Signin successful",
        "token": token,
        "user": {"id": user["id"], "fullName": user["full_name"], "email": user["email"]},
    }


@app.route('/auth/me', methods=['GET'])
def me():
    user = get_current_user()
    if not user:
        return {"error": "Unauthorized"}, 401
    return {"user": {"id": user["id"], "fullName": user["full_name"], "email": user["email"]}}


init_db()

@app.route("/", methods=['POST'])
def read_root():
    data = request.get_json(silent=True) or {}
    input_images = data.get('image', [])
    if not isinstance(input_images, list) or len(input_images) == 0:
        return {"error": "image must be a non-empty list"}, 400

    predict_img = []
    boxes = []
    for item in input_images:
        image = get_cv2_image_from_base64_string(item)
        if image is None:
            return {"error": "Invalid image payload"}, 400
        image = cv2.resize(image, (224, 224))
        predict_img.append(image)
        boxes.append(get_localization_box(image))

    prediction = loaded_model.predict(np.array(predict_img), verbose=0)
    return {"result": prediction[:, 1].tolist(), "boxes": boxes}


if __name__ == '__main__':
    # Bind explicitly so localhost requests always work on Windows.
    app.run(host="127.0.0.1", port=5000)
