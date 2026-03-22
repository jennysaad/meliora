# meliora
Pharmahacks Meliora 

# Meliora — Detecting Alzheimer's Disease from EEG Recordings
### PharmaHacks 2026 | Challenge 3

## Overview

In 2025, an estimated 771,939 people in Canada live with dementia, including Alzheimer's disease. Early detection is critical but current methods are expensive and inaccessible. This project uses EEG (electroencephalogram) recordings to classify whether a patient has Alzheimer's disease or is healthy, using machine learning on extracted brain wave features.

## Team

| Name | Role |
|------|------|
| Eva & Jenny | Data loading, feature extraction, preprocessing pipeline |
| Aasees & Sara | Model training, evaluation, results |

## Task

Binary classification: **AD vs CN** (Alzheimer's Disease vs Healthy Controls)

## Dataset

- 88 subjects total (36 AD, 23 FTD, 29 CN)
- 19 EEG electrodes, 500 Hz sampling rate
- Training set: 38 subjects (25 AD, 13 CN)
- Recordings vary in length (approx. 3-5 min per subject in training)

## Approach

### Feature Extraction
Raw EEG signals are processed using a sliding window approach (30-second windows, 15-second overlap, downsampled to 128 Hz). For each window we extract:
- **Relative Band Power (RBP)** — how much energy is in each of 5 frequency bands (delta, theta, alpha, beta, gamma) per electrode
- **Spectral Coherence Connectivity (SCC)** — how synchronized each electrode is with the others

We compute both the mean and standard deviation across time steps, giving us **380 features per window** (95 RBP mean + 95 SCC mean + 95 RBP std + 95 SCC std).

### Model Training
We train four gradient boosted tree models and compare them:
- CatBoost
- Random Forest
- XGBoost
- LightGBM

Key methodological decisions:
- **GroupShuffleSplit** to split by subject and avoid data leakage
- **Class balancing** to handle the imbalanced dataset (25 AD vs 13 CN)
- **Majority voting** for subject-level evaluation as required by the challenge

## Results (Internal Validation)

| Model | Accuracy | F1 |
|-------|----------|----|
| CatBoost | 0.625 | 0.4 |
| Random Forest | 0.625 | 0.4 |
| XGBoost | 0.750 | 0.5 |
| LightGBM | 0.625 | 0.4 |

XGBoost performs best on held-out subjects. Note: validation set contains only 8 subjects due to the small dataset size, so these numbers should be interpreted carefully.

## Setup

### Requirements
Python 3.10+

### Install dependencies
```bash
python3 -m venv pharmahacks-env
source pharmahacks-env/bin/activate
pip install -r requirements.txt
```

### Data
Download the training data from the [Google Drive folder](https://drive.google.com/drive/folders/1P4ai1Bq7GH3ZU8RtuwT1SseHErud4rlE?usp=sharing) and place it in the following structure:

```
meliora/
└── training/
    ├── AD/
    │   ├── 3.npy
    │   └── ...
    └── CN/
        ├── 10.npy
        └── ...
```

## How to Run

**Step 1 — Feature extraction** (takes 15-30 minutes):
```bash
python3 preprocess.py
```
This loads all EEG recordings, extracts RBP and SCC features, and saves everything to `dataset.pt`.

**Step 2 — Model training:**
```bash
python3 model_training.py
```
This loads `dataset.pt`, flattens the features, splits by subject, trains four models, and prints the results table.

## Project Structure

```
meliora/
├── preprocess.py               # feature extraction pipeline
├── model_training.py           # model training and evaluation
├── startercode.py              # helper functions from challenge organizers
├── requirements.txt            # python dependencies
├── jupyter_notebooks/          # exploratory notebooks
│   ├── eva_jenny_pharmahacks.ipynb
│   ├── neuro_participants.ipynb
│   └── phase1_by_aasees.ipynb
└── training/                   # EEG data (not tracked by git)
    ├── AD/
    └── CN/
```

## References

- Miltiadous et al. (2023). *A Dataset of Scalp EEG Recordings of Alzheimer's Disease, Frontotemporal Dementia and Healthy Subjects from Routine EEG*. Data, 8(6). https://doi.org/10.3390/data8060095
- Miltiadous et al. (2023). *DICE-Net: A Novel Convolution-Transformer Architecture for Alzheimer Detection in EEG Signals*. IEEE Access, 11, 71840-71858.