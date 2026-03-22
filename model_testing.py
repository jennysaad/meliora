import numpy as np
import torch
import joblib
from pathlib import Path
from scipy.stats import skew, kurtosis
from tabulate import tabulate

# Load the saved model
model = joblib.load("xgboost_model.pkl")

# Load your new dataset — must be processed the same way as training data
data = torch.load("testingset.pt", weights_only=False)

X_rbp = data["X_rbp"]
X_scc = data["X_scc"]
y_tensor = data["y"]
groups = data["groups"]

rbp_np = X_rbp.numpy()
scc_np = X_scc.numpy()

# identical feature extraction to model_training.py
rbp_mean = np.mean(rbp_np, axis=1)
scc_mean = np.mean(scc_np, axis=1)
rbp_std  = np.std(rbp_np, axis=1, ddof=1)
scc_std  = np.std(scc_np, axis=1, ddof=1)

rbp_mean_flat = rbp_mean.reshape(len(rbp_mean), -1)
scc_mean_flat = scc_mean.reshape(len(scc_mean), -1)
rbp_std_flat  = rbp_std.reshape(len(rbp_std), -1)
scc_std_flat  = scc_std.reshape(len(scc_std), -1)

X = np.hstack([rbp_mean_flat, scc_mean_flat, rbp_std_flat, scc_std_flat])
y = y_tensor.squeeze().numpy().astype(int)
X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

# majority vote per subject
def majority_vote(y_pred, y_true, subs):
    preds, trues = [], []
    for s in np.unique(subs):
        mask = subs == s
        preds.append(int(np.round(np.mean(y_pred[mask]))))
        trues.append(y_true[mask][0])
    return np.array(preds), np.array(trues)

pred  = model.predict(X)
proba = model.predict_proba(X)[:, 1]

subj_preds, subj_trues = majority_vote(pred, y, groups)

# print results
rows = []
for subject, prediction, confidence in zip(np.unique(groups), subj_preds, proba):
    rows.append([subject, "AD" if prediction == 1 else "CN", f"{confidence:.4f}"])

print(tabulate(rows, headers=["Subject", "Prediction", "Confidence"], tablefmt="rounded_outline"))