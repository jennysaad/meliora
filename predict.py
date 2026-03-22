import numpy as np
import joblib
import sys
import os
from tabulate import tabulate
from utils import load_dataset, extract_features, majority_vote, build_dataset_from_sources

# =================================================================
# PREDICT.PY
# Run predictions on a new folder of .npy files.
# Supports selecting which model to use.
#
# Usage:
#   python predict.py                                      # xgboost + default folders
#   python predict.py --model catboost
# =================================================================

VALID_MODELS = ["xgboost", "catboost", "random_forest", "lightgbm"]

def load_model(model_name):
    if model_name not in VALID_MODELS:
        raise ValueError(f"Unknown model '{model_name}'. Choose from: {VALID_MODELS}")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    return joblib.load(os.path.join(BASE_DIR, "models", f"{model_name}_model.pkl"))


def run_predict(sources, model_name="xgboost"):
    """
    sources:     list of (path, label) tuples
    model_name:  one of xgboost, catboost, random_forest, lightgbm

    returns: list of dicts with subject, prediction, confidence
    """
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    TESTINGSET_PATH = os.path.join(BASE_DIR, "testingset.pt")
    build_dataset_from_sources(sources, TESTINGSET_PATH)

    X_rbp, X_scc, y_tensor, groups = load_dataset(TESTINGSET_PATH)
    X = extract_features(X_rbp, X_scc)
    y = y_tensor.squeeze().numpy().astype(int)

    model = load_model(model_name)
    pred  = model.predict(X)
    proba = model.predict_proba(X)[:, 1]

    subj_preds, subj_trues = majority_vote(pred, y, groups)

    results = []
    for subject, prediction in zip(np.unique(groups), subj_preds):
        mask = groups == subject
        avg_confidence = round(float(np.mean(proba[mask])) * 100, 2)
        results.append({
            "subject":    str(subject),
            "prediction": "AD" if prediction == 1 else "CN",
            "confidence": avg_confidence
        })

    return results


# run directly from terminal if needed
if __name__ == "__main__":
    args = sys.argv[1:]

    # parse optional --model flag
    model_name = "xgboost"
    if "--model" in args:
        idx = args.index("--model")
        model_name = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    # parse source folders: AD:path/to/AD CN:path/to/CN
    sources = []
    for arg in args:
        label_str, path = arg.split(":")
        sources.append((path, 1 if label_str.upper() == "AD" else 0))

    if not sources:
        sources = [("testing/AD vs CN", 1)]

    results = run_predict(sources, model_name)
    rows = [[r["subject"], r["prediction"], f"{r['confidence']:.2f}%"] for r in results]
    print(f"\nResults using {model_name}:")
    print(tabulate(rows, headers=["Subject", "Prediction", "Confidence"], tablefmt="rounded_outline"))