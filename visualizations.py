import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, confusion_matrix, ConfusionMatrixDisplay, roc_curve
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from lightgbm import LGBMClassifier
from utils import load_dataset, extract_features, majority_vote

# =================================================================
# VISUALIZATIONS.PY
# Generates all plots for the presentation and report.
# Run after model_training.py has been run at least once.
# =================================================================

# --- LOAD AND PREPARE DATA ---
X_rbp, X_scc, y_tensor, groups = load_dataset("datasets/dataset.pt")
X = extract_features(X_rbp, X_scc)
y = y_tensor.squeeze().numpy().astype(int)

splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(splitter.split(X, y, groups=groups))

X_train, X_test = X[train_idx], X[test_idx]
y_train, y_test = y[train_idx], y[test_idx]
groups_train    = groups[train_idx]
groups_test     = groups[test_idx]

pos_weight = len(y_train[y_train == 0]) / max(len(y_train[y_train == 1]), 1)

models = {
    "XGBoost":       XGBClassifier(scale_pos_weight=pos_weight, eval_metric='logloss'),
    "CatBoost":      CatBoostClassifier(verbose=0, auto_class_weights='Balanced'),
    "Random Forest": RandomForestClassifier(class_weight='balanced'),
    "LightGBM":      LGBMClassifier(class_weight='balanced'),
}

# train all models and collect results
results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    pred  = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]
    subj_preds, subj_trues = majority_vote(pred, y_test, groups_test)
    results[name] = {
        "model":       model,
        "pred":        pred,
        "proba":       proba,
        "subj_preds":  subj_preds,
        "subj_trues":  subj_trues,
        "acc":         accuracy_score(subj_trues, subj_preds),
        "f1":          f1_score(subj_trues, subj_preds, zero_division=0),
    }

# =================================================================
# PLOT 1: CLASS DISTRIBUTION
# shows how many AD vs CN subjects we have in training
# =================================================================
ad_count = int((y == 1).sum() / len(y) * len(np.unique(groups)))
cn_count = len(np.unique(groups)) - ad_count

fig, ax = plt.subplots(figsize=(6, 4))
bars = ax.bar(["Healthy (CN)", "Alzheimer's (AD)"], [cn_count, ad_count],
              color=['steelblue', 'coral'], width=0.5)
ax.set_ylabel("Number of Subjects")
ax.set_title("Training Set: Class Distribution")
for bar, val in zip(bars, [cn_count, ad_count]):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.2,
            str(val), ha='center', fontweight='bold', fontsize=14)
ax.set_ylim(0, max(cn_count, ad_count) + 3)
plt.tight_layout()
plt.savefig("plots/class_distribution.png", dpi=150)
plt.show()
print("Saved plots/class_distribution.png")

# =================================================================
# PLOT 2: MODEL COMPARISON — Accuracy and F1
# side by side bar chart comparing all four models
# =================================================================
names = list(results.keys())
accs  = [results[n]["acc"] for n in names]
f1s   = [results[n]["f1"]  for n in names]

x = np.arange(len(names))
width = 0.35

fig, ax = plt.subplots(figsize=(9, 5))
bars1 = ax.bar(x - width/2, accs, width, label='Accuracy', color='steelblue')
bars2 = ax.bar(x + width/2, f1s,  width, label='F1 Score',  color='coral')

ax.set_ylabel("Score")
ax.set_title("Model Comparison (Subject-Level Evaluation)")
ax.set_xticks(x)
ax.set_xticklabels(names)
ax.legend()
ax.set_ylim(0, 1.1)

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
            f"{bar.get_height():.2f}", ha='center', fontsize=9)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.02,
            f"{bar.get_height():.2f}", ha='center', fontsize=9)

plt.tight_layout()
plt.savefig("plots/model_comparison.png", dpi=150)
plt.show()
print("Saved plots/model_comparison.png")

# =================================================================
# PLOT 3: CONFUSION MATRIX for each model
# shows exactly where each model makes mistakes
# =================================================================
fig, axes = plt.subplots(2, 2, figsize=(10, 8))
axes = axes.flatten()

for i, (name, res) in enumerate(results.items()):
    cm = confusion_matrix(res["subj_trues"], res["subj_preds"])
    disp = ConfusionMatrixDisplay(cm, display_labels=["Healthy (CN)", "AD"])
    disp.plot(cmap="Blues", ax=axes[i], colorbar=False)
    axes[i].set_title(f"{name}\nAcc={res['acc']:.2f}  F1={res['f1']:.2f}")

plt.suptitle("Confusion Matrices — Subject-Level Predictions", fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig("plots/confusion_matrices.png", dpi=150)
plt.show()
print("Saved plots/confusion_matrices.png")

# =================================================================
# PLOT 4: ROC CURVES for each model
# shows how well each model separates AD from CN at different thresholds
# =================================================================
fig, ax = plt.subplots(figsize=(7, 6))
colors = ['steelblue', 'coral', 'mediumseagreen', 'mediumpurple']

for (name, res), color in zip(results.items(), colors):
    fpr, tpr, _ = roc_curve(y_test, res["proba"])
    auc = roc_auc_score(y_test, res["proba"])
    ax.plot(fpr, tpr, label=f"{name} (AUC={auc:.3f})", color=color, linewidth=2)

ax.plot([0, 1], [0, 1], 'k--', linewidth=1, label='Random guess')
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curves — Window-Level Predictions")
ax.legend(loc='lower right')
plt.tight_layout()
plt.savefig("plots/roc_curves.png", dpi=150)
plt.show()
print("Saved plots/roc_curves.png")

# =================================================================
# PLOT 5: FEATURE IMPORTANCE for XGBoost
# shows which brain wave features the model relies on most
# =================================================================
band_names = ['delta', 'theta', 'alpha', 'beta', 'gamma']
ch_names   = ['Fp1','Fp2','F7','F3','Fz','F4','F8','T3','C3',
               'Cz','C4','T4','T5','P3','Pz','P4','T6','O1','O2']

feature_names = []
for band in band_names:
    for ch in ch_names:
        feature_names.append(f"RBP_mean_{ch}_{band}")
for band in band_names:
    for ch in ch_names:
        feature_names.append(f"SCC_mean_{ch}_{band}")
for band in band_names:
    for ch in ch_names:
        feature_names.append(f"RBP_std_{ch}_{band}")
for band in band_names:
    for ch in ch_names:
        feature_names.append(f"SCC_std_{ch}_{band}")

xgb_model = results["XGBoost"]["model"]
importances = xgb_model.feature_importances_
top_n = 15
top_idx = np.argsort(importances)[-top_n:]

fig, ax = plt.subplots(figsize=(10, 6))
ax.barh(range(top_n), importances[top_idx], color='steelblue')
ax.set_yticks(range(top_n))
ax.set_yticklabels([feature_names[i] for i in top_idx], fontsize=9)
ax.set_xlabel("Feature Importance")
ax.set_title(f"Top {top_n} Most Important Features — XGBoost")
plt.tight_layout()
plt.savefig("plots/feature_importance.png", dpi=150)
plt.show()
print("Saved plots/feature_importance.png")

# =================================================================
# PLOT 6: WINDOW COUNT PER SUBJECT
# shows how many 30-second windows each subject contributed
# =================================================================
unique_subjects, window_counts = np.unique(groups, return_counts=True)
subject_labels = [f"AD\nS{s}" if y[groups == s][0] == 1 else f"CN\nS{s}"
                  for s in unique_subjects]
colors_subj = ['coral' if y[groups == s][0] == 1 else 'steelblue'
               for s in unique_subjects]

fig, ax = plt.subplots(figsize=(14, 5))
ax.bar(range(len(unique_subjects)), window_counts, color=colors_subj)
ax.set_xticks(range(len(unique_subjects)))
ax.set_xticklabels(subject_labels, fontsize=7)
ax.set_ylabel("Number of Windows")
ax.set_title("Windows Per Subject (red = AD, blue = CN)")
plt.tight_layout()
plt.savefig("plots/windows_per_subject.png", dpi=150)
plt.show()
print("Saved plots/windows_per_subject.png")

print("\nAll plots saved to plots/ folder")