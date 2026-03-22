import numpy as np
import torch
from pathlib import Path
from startercode import load_npy, generate_dataset

# =================================================================
# UTILS.PY
# Shared functions used by preprocess.py, model_training.py, and predict.py.
# =================================================================

def load_dataset(pt_path):
    """Load a saved .pt dataset file and return raw tensors"""
    data = torch.load(pt_path, weights_only=False)
    return data["X_rbp"], data["X_scc"], data["y"], data["groups"]

def extract_features(X_rbp, X_scc):
    """
    Collapse (N, 30, 5, 19) tensors into (N, 380) feature matrix.
    Must be identical everywhere — training, testing, and Flask backend.
    mean_rbp (95) + mean_scc (95) + std_rbp (95) + std_scc (95) = 380 features
    """
    rbp_np = X_rbp.numpy() if hasattr(X_rbp, 'numpy') else X_rbp
    scc_np = X_scc.numpy() if hasattr(X_scc, 'numpy') else X_scc

    rbp_mean = np.mean(rbp_np, axis=1)
    scc_mean = np.mean(scc_np, axis=1)
    rbp_std  = np.std(rbp_np, axis=1, ddof=1)
    scc_std  = np.std(scc_np, axis=1, ddof=1)

    X = np.hstack([
        rbp_mean.reshape(len(rbp_mean), -1),
        scc_mean.reshape(len(scc_mean), -1),
        rbp_std.reshape(len(rbp_std), -1),
        scc_std.reshape(len(scc_std), -1),
    ])

    return np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

def majority_vote(y_pred, y_true, subs):
    """
    Combine window-level predictions into one per subject.
    If more than half the windows say AD, the final answer is AD.
    """
    preds, trues = [], []
    for s in np.unique(subs):
        mask = subs == s
        preds.append(int(np.round(np.mean(y_pred[mask]))))
        trues.append(y_true[mask][0])
    return np.array(preds), np.array(trues)

def build_dataset_from_sources(sources, output_pt_path, sfreq=128):
    """
    sources: a list of (path, label) tuples.
             path can be a folder OR a single .npy file.
             label is 1 for AD, 0 for CN.

    Examples:
        # One folder each
        build_dataset_from_sources([
            ("training/AD", 1),
            ("training/CN", 0),
        ], "dataset.pt")

        # Multiple folders combined
        build_dataset_from_sources([
            ("training/AD",  1),
            ("testing/AD",   1),
            ("training/CN",  0),
            ("testing/CN",   0),
        ], "combined.pt")

        # Single files
        build_dataset_from_sources([
            ("data/subject_01.npy", 1),
            ("data/subject_02.npy", 0),
        ], "dataset.pt")
    """
    data_list, labels, subject_ids = [], [], []

    for path, label in sources:
        path = Path(path)
        assert path.exists(), f"Path not found: {path}"

        # collect files — either the single file or everything in the folder
        if path.is_file() and path.suffix == '.npy':
            files = [path]
        elif path.is_dir():
            files = sorted([f for f in path.iterdir() if f.is_file() and f.suffix == '.npy'])
        else:
            raise ValueError(f"{path} is not a .npy file or a directory")

        for f in files:
            data_list.append(load_npy(f))
            labels.append(label)
            subject_ids.append(int(f.stem))

    X_rbp, X_scc, y, groups = generate_dataset(
        data_list, labels, subject_ids, sfreq=sfreq
    )

    torch.save({
        "X_rbp":  X_rbp,
        "X_scc":  X_scc,
        "y":      y.squeeze(),
        "groups": groups
    }, output_pt_path)

    print(f"Saved to {output_pt_path} — {sum(labels)} AD, {labels.count(0)} CN, {len(labels)} total")