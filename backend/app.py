from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from predict import run_predict, VALID_MODELS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'message': 'Hello from Flask!',
        'data': [1, 2, 3]
    })

@app.route("/models", methods=["GET"])
def get_models():
    """Return the list of available models for the frontend dropdown"""
    return jsonify({"models": VALID_MODELS})

@app.route("/predict", methods=["POST"])
def predict():
    print('predicting')
    files = request.files.getlist("files")
    label = int(request.form.get("label", 1))          # 1=AD, 0=CN
    model_name = request.form.get("model", "xgboost")  # model selected in frontend

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    if model_name not in VALID_MODELS:
        return jsonify({"error": f"Invalid model. Choose from: {VALID_MODELS}"}), 400

    # save uploaded .npy files to a temp folder
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    for f in files:
        filename = os.path.basename(f.filename)
        if not filename or not filename.endswith(".npy"):
            continue
        f.save(os.path.join(UPLOAD_DIR, filename))

    sources = [(UPLOAD_DIR, label)]

    try:
        results = run_predict([(UPLOAD_DIR, label)], model_name)
        return jsonify({"results": results, "model": model_name})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)