from flask import Flask, request
from tf_keras.models import model_from_json
from flask_cors import CORS
import numpy as np
import cv2
import base64

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

with open('model.json', 'r', encoding='utf-8') as json_file:
    loaded_model_json = json_file.read()
loaded_model = model_from_json(loaded_model_json)
loaded_model.load_weights("model.h5")


def get_cv2_image_from_base64_string(b64str):
    try:
        encoded_data = b64str.split(',', 1)[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None


@app.route('/home',methods=['GET'])
def home():
    return {"status": "ok"}

@app.route("/", methods=['POST'])
def read_root():
    data = request.get_json(silent=True) or {}
    input_images = data.get('image', [])
    if not isinstance(input_images, list) or len(input_images) == 0:
        return {"error": "image must be a non-empty list"}, 400

    predict_img = []
    for item in input_images:
        image = get_cv2_image_from_base64_string(item)
        if image is None:
            return {"error": "Invalid image payload"}, 400
        image = cv2.resize(image, (224, 224))
        predict_img.append(image)

    prediction = loaded_model.predict(np.array(predict_img), verbose=0)
    return {"result": prediction[:, 1].tolist()}


if __name__ == '__main__':
    # Bind explicitly so localhost requests always work on Windows.
    app.run(host="127.0.0.1", port=5000)
