from startercode import load_npy, extract_features
import os
from pathlib import Path

# define file paths
AD_path = Path('training/AD')
CN_path = Path('training/CN')

filesAD = sorted([f for f in AD_path.iterdir() if f.is_file()])
filesCN = sorted([f for f in CN_path.iterdir() if f.is_file()])

# process data
def process_data(path):
    # save npy file id
    name = path.as_posix().split('/')[2]
    id = name.split('.')[0]

    # extract features from data
    data = load_npy(path)
    rbp, scc = extract_features(data, 128)
    print(f'rbp {rbp} scc {scc}')

def save_data_to_csv(id, rbp, scc):
    pass

# iterate through all files to process
for path in filesAD:         
    process_data(path) #TODO: save ad and cn info separately into list or dict or smth
    break
# for path in filesCN:
#     process_data(path)

