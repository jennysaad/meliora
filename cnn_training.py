import torch
from sklearn.model_selection import train_test_split

# models
from catboost import CatBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

data = torch.load("dataset.pt", weights_only=False)

X_rbp = data["X_rbp"]       # shape (N, 30, 5, 19)
X_scc = data["X_scc"]       # shape (N, 30, 5, 19) 
y = data["y"]               # shape (N,) -- 0 or 1
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

# Calculate mean and std
mean_rbp = torch.mean(X_rbp, dim=1)
mean_scc = torch.mean(X_scc, dim=1)

std_rbp = torch.std(X_rbp, dim=1)
std_scc = torch.std(X_scc, dim=1)

# Flatten data from 2d-1d
flattened_m_r = torch.flatten(mean_rbp, start_dim=1)
flattened_m_s = torch.flatten(mean_scc, start_dim=1)
flattened_s_r = torch.flatten(std_rbp, start_dim=1)
flattened_s_s = torch.flatten(std_scc, start_dim=1)

# Concatenate four tensors together
concatenated_data = torch.cat([flattened_m_r, flattened_m_s, flattened_s_r, flattened_s_s], dim=1)

# Convert to numpy array
input_data = concatenated_data.numpy()
print(input_data)

# Split data - 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(
    input_data, 
    y, 
    test_size=0.2, 
    random_state=42, 
    stratify=y
)

# Split the 80% into 60 and 20 (20 validation set, use each separate model on this)
X_trainmodel, X_validation, y_trainmodel, y_validation = train_test_split(
    X_train, 
    y_train, 
    test_size=0.2, 
    random_state=42, 
    stratify=y_train
)

# Initialize models and fit data
catModel = CatBoostClassifier(iterations=10, learning_rate=0.1, depth=3) # CatBoost model
rfModel = RandomForestClassifier(iterations=10, learning_rate=0.1, depth=3) # RandomForest model

catModel.fit(X_trainmodel, y_trainmodel, verbose=0)
rfModel.fit(X_trainmodel, y_trainmodel, verbose=0)