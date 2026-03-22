import joblib
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from lightgbm import LGBMClassifier
from tabulate import tabulate
from utils import load_dataset, extract_features, majority_vote

# =================================================================
# MODEL_TRAINING.PY
# Trains four models, evaluates on hold-out, saves each to disk.
# =================================================================

X_rbp, X_scc, y_tensor, groups = load_dataset("datasets/dataset.pt")

X = extract_features(X_rbp, X_scc)
y = y_tensor.squeeze().numpy().astype(int)

# Split by subject — 80% train, 20% hold-out
splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_train, X_test = X[train_idx], X[test_idx]
y_train, y_test = y[train_idx], y[test_idx]
groups_train    = groups[train_idx]
groups_test     = groups[test_idx]

# Class imbalance ratio for XGBoost
pos_weight = len(y_train[y_train == 0]) / max(len(y_train[y_train == 1]), 1)

# Define all four models
models = {
    "xgboost":       XGBClassifier(scale_pos_weight=pos_weight, eval_metric='logloss'),
    "catboost":      CatBoostClassifier(verbose=0, auto_class_weights='Balanced'),
    "random_forest": RandomForestClassifier(class_weight='balanced'),
    "lightgbm":      LGBMClassifier(class_weight='balanced'),
}

rows = []

for name, model in models.items():
    # Train
    model.fit(X_train, y_train)

    # Evaluate
    pred  = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]

    subj_preds, subj_trues = majority_vote(pred, y_test, groups_test)

    acc = accuracy_score(subj_trues, subj_preds)
    f1  = f1_score(subj_trues, subj_preds, zero_division=0)
    auc = roc_auc_score(y_test, proba)

    rows.append([name, f"{acc:.4f}", f"{f1:.4f}", f"{auc:.4f}"])

    # Save each model separately
    joblib.dump(model, f"models/{name}_model.pkl")
    print(f"Saved {name}_model.pkl")

print("\nFinal hold-out results:")
print(tabulate(rows, headers=["Model", "Accuracy", "F1", "AUC"], tablefmt="rounded_outline"))