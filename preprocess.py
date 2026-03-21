from startercode import load_npy, reduce_eeg_size, generate_dataset
from pathlib import Path
import torch

# TARGET_LENGTH = 128 * 300 # this relates to the time taken to create the dataset

# define file paths
AD_path = Path('training/AD')
CN_path = Path('training/CN')

filesAD = sorted([f for f in AD_path.iterdir() if f.is_file()])
filesCN = sorted([f for f in CN_path.iterdir() if f.is_file()])

# containers
data_list = []
labels = []
subject_ids = []

# load ad -- label 1
for path in filesAD:
    data = load_npy(path)  # (channels, time)

    id = path.stem  # filename without .npy

    data_list.append(data)
    labels.append(1)
    subject_ids.append(id)

# load cn -- label 0
for path in filesCN:
    data = load_npy(path)  # (channels, time)

    id = path.stem  # filename without .npy

    data_list.append(data)
    labels.append(0)
    subject_ids.append(id)

# # reduce dataset size
# data_list = reduce_eeg_size(data_list, TARGET_LENGTH)

# generate dataset
X_rbp, X_scc, y, groups = generate_dataset(
    data_list,
    labels,
    subject_ids,
    sfreq=128
)

print('generated')

# save dataset to pt file
torch.save({
    "X_rbp": X_rbp,
    "X_scc": X_scc,
    "y": y.squeeze(),
    "groups": groups
}, "dataset.pt")