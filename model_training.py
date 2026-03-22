import numpy as np
import torch
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score

# models
from catboost import CatBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

data = torch.load("dataset.pt", weights_only=False)

X_rbp = data["X_rbp"]       # shape (N, 30, 5, 19)
X_scc = data["X_scc"]       # shape (N, 30, 5, 19) 
y_tensor = data["y"]               # shape (N,) -- 0 or 1
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
rbp_mean = np.mean(rbp_np, axis=1)
scc_mean = np.mean(scc_np, axis=1)
rbp_std  = np.std(rbp_np, axis=1, ddof=1)
scc_std  = np.std(scc_np, axis=1, ddof=1)

# Flatten from 2D to 1D
rbp_mean_flat = rbp_mean.reshape(len(rbp_mean), -1)
scc_mean_flat = scc_mean.reshape(len(scc_mean), -1)
rbp_std_flat  = rbp_std.reshape(len(rbp_std), -1)
scc_std_flat  = scc_std.reshape(len(scc_std), -1)

# Concatenate all four arrays
X = np.hstack([rbp_mean_flat, scc_mean_flat, rbp_std_flat, scc_std_flat])

# Convert labels from pytorch format to 0 and 1
y = y_tensor.squeeze().numpy().astype(int)

# Replace any broken values (e.g. NaN or Infinity) to 0
X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

# Split data - 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(
    X, 
    y, 
    test_size=0.2, 
    random_state=42, 
    stratify=y
)

# Split the 80% into 60 and 20 (20 validation set, use each separate model on this)
X_traintest, X_validation, y_traintest, y_validation = train_test_split(
    X_train, 
    y_train, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_train
)

# Initialize models, fit data, predict output
catModel = CatBoostClassifier(verbose=0)
rfModel = RandomForestClassifier()
xgbModel = XGBClassifier()
lgbmModel = LGBMClassifier()

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

# Accuracy
catCorrect = accuracy_score(y_validation, catPred)
rfCorrect = accuracy_score(y_validation, rfPred)
xgbCorrect = accuracy_score(y_validation, xgbPred)
lgbmCorrect = accuracy_score(y_validation, lgbmPred)

# Area under curve (how well the model's probability scores separate the two classes e.g. maybe it is just guessing)
catAUC = roc_auc_score(y_validation, catProba)
rfAUC = roc_auc_score(y_validation, rfProba)
xgbAUC = roc_auc_score(y_validation, xgbProba)
lgbmAUC = roc_auc_score(y_validation, lgbmProba)

from tabulate import tabulate

results = [
    ["CatBoost",      f"{catCorrect:.4f}",  f"{catAUC:.4f}"],
    ["Random Forest", f"{rfCorrect:.4f}",   f"{rfAUC:.4f}"],
    ["XGBoost",       f"{xgbCorrect:.4f}",  f"{xgbAUC:.4f}"],
    ["LightGBM",      f"{lgbmCorrect:.4f}", f"{lgbmAUC:.4f}"],
]

print(tabulate(results, headers=["Model", "Accuracy", "AUC"], tablefmt="rounded_outline"))