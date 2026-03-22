from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import run_predict, VALID_MODELS
import os

app = Flask(__name__)
CORS(app)

@app.route("/models", methods=["GET"])
def get_models():
    """Return the list of available models for the frontend dropdown"""
    return jsonify({"models": VALID_MODELS})

@app.route("/predict", methods=["POST"])
def predict():
    files = request.files.getlist("files")
    label = int(request.form.get("label", 1))          # 1=AD, 0=CN
    model_name = request.form.get("model", "xgboost")  # model selected in frontend

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    if model_name not in VALID_MODELS:
        return jsonify({"error": f"Invalid model. Choose from: {VALID_MODELS}"}), 400

    # save uploaded .npy files to a temp folder
    os.makedirs("uploads", exist_ok=True)
    for f in files:
        f.save(f"uploads/{f.filename}")

    try:
        results = run_predict([("uploads", label)], model_name)
        return jsonify({"results": results, "model": model_name})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)