from startercode import load_npy, generate_dataset
from pathlib import Path
import torch
import pandas as pd

# =================================================================
# PREPROCESS.PY
# This script loads all EEG recordings, extracts features using
# the starter's generate_dataset() function, and saves everything
# to disk as dataset.pt so model_training.py can load it.
# =================================================================

# TARGET_LENGTH = 128 * 300 # this relates to the time taken to create the dataset

# define file paths
AD_path = Path('testing/AD vs CN')
CN_path = Path('training/CN')

# Check that both folders actually exist before we try to load from them
assert AD_path.exists(), f"ERROR: AD folder not found at {AD_path}"
assert CN_path.exists(), f"ERROR: CN folder not found at {CN_path}"

# Get a sorted list of every .npy file in each folder
filesAD = sorted([f for f in AD_path.iterdir() if f.is_file() and f.suffix == '.npy'])
filesCN = sorted([f for f in CN_path.iterdir() if f.is_file() and f.suffix == '.npy'])

# containers - 3 parallel lists
data_list = []      # will hold numpy arrays (19, num_timepoints)
labels = []         # will hold integers: 1 = AD, 0 = CN
subject_ids = []    # will hold integers: the subject ID number

# load ad -- label 1
for path in filesAD:
    data = load_npy(path)           # (channels, time) - returns a numpy array

    id = int(path.stem)             # extracts filename without .npy

    data_list.append(data)
    labels.append(1)                # AD = 1
    subject_ids.append(id)

# load cn -- label 0
for path in filesCN:
    data = load_npy(path)           # (channels, time)

    id = int(path.stem)             # filename without .npy

    data_list.append(data)
    labels.append(0)                # CN = 0
    subject_ids.append(id)

# generate dataset - generate dataset
X_rbp, X_scc, y, groups = generate_dataset(
    data_list,      # our list of raw EEG arrays
    labels,         # our list of labels: 1=AD, 0=CN
    subject_ids,    # our list of subject ID integers
    sfreq=128       # downsample to 128 Hz
)

# save dataset to pt file - save to disk
torch.save({
    "X_rbp": X_rbp,
    "X_scc": X_scc,
    "y": y.squeeze(),           # removes extra dimension: (N,1) → (N,)
    "groups": groups    
}, "testingset.pt")