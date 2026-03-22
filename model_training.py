import numpy as np
import torch
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

# models
from catboost import CatBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

# =================================================================
# MODEL_TRAINING.PY
# This script loads the features saved by preprocess.py,
# flattens them into a format sklearn can use, splits by subject
# to avoid data leakage, trains four models, and compares them.
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

# In order to use a gradient boosted tree, we must collapse the 3D data into 2D
#   Two options:
#   Flatten everything -- ex take (30, 10, 19) and turn it into 30*10*19 = 5700
#   Take freq and channel, compute their mean across time. same with std. then concatenate
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

# Flatten from 2D to 1D
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

X_traintest = X[train_idx]
X_validation = X[val_idx]
y_traintest = y[train_idx]
y_validation = y[val_idx]

val_groups = groups[val_idx]

# We have 25 AD vs 13 CN — almost 2x more AD than CN
# Without balancing, models are biased toward always predicting AD
# since that's the majority class — they get decent accuracy but
# never correctly identify healthy subjects

# calculate the imbalance ratio for XGBoost (it uses a different
# parameter than the other models)
# example: 13 CN / 25 AD = 0.52 → XGBoost will weight CN samples higher
pos_weight = len(y_traintest[y_traintest == 0]) / max(len(y_traintest[y_traintest == 1]), 1)

# class_weight='balanced' tells sklearn models to automatically
# give more importance to the minority class (CN)
# auto_class_weights='Balanced' does the same for CatBoost
# scale_pos_weight does the same for XGBoost using our ratio above
catModel = CatBoostClassifier(verbose=0, auto_class_weights='Balanced')
rfModel = RandomForestClassifier(class_weight='balanced')
xgbModel = XGBClassifier(scale_pos_weight=pos_weight, eval_metric='logloss')
lgbmModel = LGBMClassifier(class_weight='balanced')

catModel.fit(X_traintest, y_traintest)
rfModel.fit(X_traintest, y_traintest)
xgbModel.fit(X_traintest, y_traintest)
lgbmModel.fit(X_traintest, y_traintest)

catPred = catModel.predict(X_validation)
rfPred = rfModel.predict(X_validation)
xgbPred = xgbModel.predict(X_validation)
lgbmPred = lgbmModel.predict(X_validation)

# Confidence score
catProba = catModel.predict_proba(X_validation)[:, 1]
rfProba = rfModel.predict_proba(X_validation)[:, 1]
xgbProba = xgbModel.predict_proba(X_validation)[:, 1]
lgbmProba = lgbmModel.predict_proba(X_validation)[:, 1]

# Majority voting — required by the challenge (section 3.1.1)
# each subject has many windows, we combine them into one final prediction
# if more than half the windows say AD, the final answer is AD
def majority_vote(y_pred, y_true, subs):
    preds, trues = [], []
    for s in np.unique(subs):
        mask = subs == s
        preds.append(int(np.round(np.mean(y_pred[mask]))))  # majority vote
        trues.append(y_true[mask][0])                       # true label (same for all windows)
    return np.array(preds), np.array(trues)

catPred_subj,  catTrue_subj  = majority_vote(catPred,  y_validation, val_groups)
rfPred_subj,   rfTrue_subj   = majority_vote(rfPred,   y_validation, val_groups)
xgbPred_subj,  xgbTrue_subj  = majority_vote(xgbPred,  y_validation, val_groups)
lgbmPred_subj, lgbmTrue_subj = majority_vote(lgbmPred, y_validation, val_groups)

# Accuracy and F1 at subject level
catCorrect  = accuracy_score(catTrue_subj,  catPred_subj)
rfCorrect   = accuracy_score(rfTrue_subj,   rfPred_subj)
xgbCorrect  = accuracy_score(xgbTrue_subj,  xgbPred_subj)
lgbmCorrect = accuracy_score(lgbmTrue_subj, lgbmPred_subj)

catF1  = f1_score(catTrue_subj,  catPred_subj,  zero_division=0)
rfF1   = f1_score(rfTrue_subj,   rfPred_subj,   zero_division=0)
xgbF1  = f1_score(xgbTrue_subj,  xgbPred_subj,  zero_division=0)
lgbmF1 = f1_score(lgbmTrue_subj, lgbmPred_subj, zero_division=0)

# Area under curve (how well the model's probability scores separate the two classes e.g. maybe it is just guessing)
catAUC = roc_auc_score(y_validation, catProba)
rfAUC = roc_auc_score(y_validation, rfProba)
xgbAUC = roc_auc_score(y_validation, xgbProba)
lgbmAUC = roc_auc_score(y_validation, lgbmProba)

from tabulate import tabulate

results = [
    ["CatBoost",      f"{catCorrect:.4f}",  f"{catF1:.4f}",  f"{catAUC:.4f}"],
    ["Random Forest", f"{rfCorrect:.4f}",   f"{rfF1:.4f}",   f"{rfAUC:.4f}"],
    ["XGBoost",       f"{xgbCorrect:.4f}",  f"{xgbF1:.4f}",  f"{xgbAUC:.4f}"],
    ["LightGBM",      f"{lgbmCorrect:.4f}", f"{lgbmF1:.4f}", f"{lgbmAUC:.4f}"],
]
print(tabulate(results, headers=["Model", "Accuracy", "F1", "AUC"], tablefmt="rounded_outline"))