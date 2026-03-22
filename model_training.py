import numpy as np
import torch
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

# models
from xgboost import XGBClassifier

from tabulate import tabulate

# =================================================================
# MODEL_TRAINING.PY
# This script loads the features saved by preprocess.py,
# flattens them into a format sklearn can use, splits by subject
# =================================================================

# Load what preprocess.py saved. This gives us back:
# X_rbp, X_scc: the features (num_windows, 30, 5, 19)
# y: the labels (num_windows,) — 0 or 1
# groups: subject ID for each window (num_windows,)
data = torch.load("dataset.pt", weights_only=False)

X_rbp = data["X_rbp"]       # shape (N, 30, 5, 19)
X_scc = data["X_scc"]       # shape (N, 30, 5, 19) 
y_tensor = data["y"]        # shape (N,) -- 0 or 1
groups = data["groups"]     # array of ids -- filename that data was extracted from

# Input - X_rbp and X_scc: (N, 30, 5, 19)
#   N  = samples
#   30 = time steps
#   5  = frequency bands
#   19 = EEG channels
# Output - y: 0 or 1

# In order to use the model, we must collapse the 3D data into 2D
# Take freq and channel, compute their mean across time. same with std. then concatenate
# Option two clearly maintains greater accuracy. We will proceed with it

# Convert from pytorch tensors to numpy arrays
rbp_np = X_rbp.numpy()
scc_np = X_scc.numpy()

# Calculate mean and std across the time slices
# (num_windows, 30, 5, 19) → (num_windows, 5, 19)
rbp_mean = np.mean(rbp_np, axis=1)
scc_mean = np.mean(scc_np, axis=1)
rbp_std  = np.std(rbp_np, axis=1, ddof=1)
scc_std  = np.std(scc_np, axis=1, ddof=1)

# Flatten from 3D to 2D
# (num_windows, 5, 19) → (num_windows, 95)
rbp_mean_flat = rbp_mean.reshape(len(rbp_mean), -1)
scc_mean_flat = scc_mean.reshape(len(scc_mean), -1)
rbp_std_flat  = rbp_std.reshape(len(rbp_std), -1)
scc_std_flat  = scc_std.reshape(len(scc_std), -1)

# Concatenate all four arrays
# mean_rbp (95) + mean_scc (95) + std_rbp (95) + std_scc (95) = 380 features
X = np.hstack([rbp_mean_flat, scc_mean_flat, rbp_std_flat, scc_std_flat])

# Convert labels from pytorch format to 0 and 1
y = y_tensor.squeeze().numpy().astype(int)

# Replace any broken values (e.g. NaN or Infinity) to 0
X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

# Split data by subject — 80% for training, 20% for validation
# GroupShuffleSplit keeps ALL windows from the same subject together
# so the model never sees the same person in both train and validation
# (regular train_test_split would split randomly by window, causing data leakage)
splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, val_idx = next(splitter.split(X, y, groups=groups))

X_train = X[train_idx]
X_test = X[val_idx]
y_train = y[train_idx]
y_test = y[val_idx]

groups_train = groups[train_idx]
groups_test = groups[val_idx]

pos_weight = len(y_train[y_train == 0]) / max(len(y_train[y_train == 1]), 1) # imbalance ratio for XGBoost -- 13 CN / 25 AD = 0.52 → XGBoost will weigh CN samples higher

# xgboost model chosen after cross comparing with other models
model = XGBClassifier(scale_pos_weight=pos_weight, eval_metric='logloss')

# Majority voting — each subject has many windows, we combine them into one final prediction. if more than half the windows say AD, the final answer is AD
def majority_vote(y_pred, y_true, subs):
    preds, trues = [], []
    for s in np.unique(subs):
        mask = subs == s
        preds.append(int(np.round(np.mean(y_pred[mask]))))  # majority vote
        trues.append(y_true[mask][0])                       # true label (same for all windows)
    return np.array(preds), np.array(trues)

# Train on full training set, evaluate once on final hold-out
final_model = XGBClassifier(scale_pos_weight=pos_weight, eval_metric='logloss')
final_model.fit(X_train, y_train)

final_pred  = final_model.predict(X_test)
final_proba = final_model.predict_proba(X_test)[:, 1]

final_subj_preds, final_subj_trues = majority_vote(final_pred, y_test, groups_test)

print("\nFinal hold-out results:")
final_rows = [[
    "XGBoost",
    f"{accuracy_score(final_subj_trues, final_subj_preds):.4f}",
    f"{f1_score(final_subj_trues, final_subj_preds, zero_division=0):.4f}",
    f"{roc_auc_score(y_test, final_proba):.4f}",
]]
print(tabulate(final_rows, headers=["Model", "Accuracy", "F1", "AUC"], tablefmt="rounded_outline"))