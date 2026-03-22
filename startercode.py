# Import these libraries to enable helper functions
import numpy as np
import pywt
import pandas as pd
import torch
import matplotlib.pyplot as plt
#from google.colab import drive
from scipy.signal import welch, resample


'''
Helper functions; you don't need to modify these.

'''

def load_npy(path):
  return np.load(path, allow_pickle=True)

def filter_subjects(df, drop_label):
    '''
    Returns the subjects array relevant to the task chosen.

    Args:
      df: the dataframe that maps each subject to its corresponding label (A, C, or F)
      drop_label: the label that is not relevant to the task chosen. Example: if i'm doing A vs C classification, then the drop label would be 'F'
    '''
    return df[df['label'] != drop_label]['anonymized_id']

def extract_features(eeg_data, sfreq, target_time_steps=30):
    """
    Extracts RBP (Welch) and SCC (PyWavelets CWT).

    Args:
        eeg_data: (Channels, Time) - A single 30-second epoch.
        sfreq: Sampling frequency (e.g., 128).
        target_time_steps: Number of time windows (30 for DICE-net).
    Returns:
        rbp: (30, 5, 19)
        scc: (30, 5, 19)
    """

    # You need to have the PyWavelet package installed to run this function
    # Uncomment the next lines to make sure you have it installed
    #!pip install PyWavelets
    #import pywt

    n_channels, n_points = eeg_data.shape
    segment_len = int(n_points / target_time_steps)

    # ---------------------------------------------------------
    # 1. Relative Band Power (RBP)
    # ---------------------------------------------------------
    bands = [(0.5, 4), (4, 8), (8, 13), (13, 25), (25, 45)]
    rbp_features = np.zeros((target_time_steps, 5, n_channels))

    for t in range(target_time_steps):
        start = t * segment_len
        end = start + segment_len
        segment = eeg_data[:, start:end]

        freqs, psd = welch(segment, fs=sfreq, nperseg=segment_len, axis=1)

        total_power = np.sum(psd, axis=1, keepdims=True)
        total_power[total_power == 0] = 1e-10

        for b_idx, (fmin, fmax) in enumerate(bands):
            idx = np.logical_and(freqs >= fmin, freqs <= fmax)
            band_power = np.sum(psd[:, idx], axis=1)
            rbp_features[t, b_idx, :] = band_power / total_power.flatten()

    # ---------------------------------------------------------
    # 2. Spectral Coherence Connectivity (SCC) - Using PyWavelets
    # ---------------------------------------------------------
    morlet_freqs = np.array([2, 6, 10, 18, 35])
    wavelet_name = 'cmor1.5-1.0'  # Complex Morlet (bandwidth 1.5, center freq 1.0)

    # Convert target frequencies (Hz) to Wavelet Scales
    # Scale = (Center_Freq * Sampling_Rate) / Target_Freq
    center_freq = pywt.central_frequency(wavelet_name)
    scales = (center_freq * sfreq) / morlet_freqs

    # Pre-allocate coefficients storage: (Channels, Bands, Time)
    coeffs_all = np.zeros((n_channels, len(morlet_freqs), n_points), dtype=np.complex128)

    # Compute CWT for each channel
    # pywt.cwt returns (coeffs, freqs) where coeffs is (len(scales), len(data))
    for ch in range(n_channels):
        cwt_out, _ = pywt.cwt(eeg_data[ch], scales, wavelet_name, sampling_period=1/sfreq)
        coeffs_all[ch, :, :] = cwt_out

    # Calculate Coherence for each 1-second window
    scc_features = np.zeros((target_time_steps, 5, n_channels))

    for t in range(target_time_steps):
        start = t * segment_len
        end = start + segment_len

        for b_idx in range(len(morlet_freqs)):
            # Get coefficients for this specific band and time window
            # Shape: (n_channels, n_samples_in_window)
            seg_coeffs = coeffs_all[:, b_idx, start:end]

            # --- Vectorized Coherence Calculation ---

            # 1. Cross-Spectral Density Matrix (CSD): X * Y_conjugate
            # Result is (19, 19) matrix of summed cross-products
            csd_matrix = seg_coeffs @ seg_coeffs.conj().T

            # 2. Power Spectral Density (Diagonal of CSD)
            psd_vec = np.diag(csd_matrix).real

            # 3. Denominator: sqrt(PSD_x * PSD_y)
            denom = np.sqrt(np.outer(psd_vec, psd_vec))
            denom[denom == 0] = 1e-10 # Safe division

            # 4. Coherence: |CSD| / Denominator
            coherence_matrix = np.abs(csd_matrix) / denom

            # 5. Average Coherence (SCC) per channel
            # "SCC involves calculating spectral coherence... and averaging these values for each electrode."
            scc_val = np.mean(coherence_matrix, axis=1)

            scc_features[t, b_idx, :] = scc_val

    return rbp_features, scc_features

def reduce_eeg_size(eeg_data, target_length):
    """
    Reduces the size of EEG data to a uniform length for all patients.

    Parameters:
        eeg_data (list of np.array): List of EEG recordings, where each recording is a 2D array
                                     (channels x time points).
        target_length (int): The desired number of time points for each patient's data.

    Returns:
        np.array: A 3D array of shape (patients, channels, target_length).
    """
    reduced_data = []

    patient_data : np.ndarray
    for patient_data in eeg_data:
        # Resample each channel of the patient's data to the target length
        num_channels, orig_length = patient_data.shape
        if orig_length > target_length:
            resampled_patient_data = np.zeros((num_channels, target_length))

            for i in range(num_channels):
                resampled_patient_data[i] = resample(patient_data[i], target_length)

            reduced_data.append(resampled_patient_data)
        else:
            reduced_data.append(patient_data)
    return np.array(reduced_data)

def pad_eeg_data(eeg_data, target_length):
    """
    Pads EEG data to a uniform length for all patients.
    Parameters:
        eeg_data (list of np.array): List of EEG recordings, where each

        recording is a 2D array (channels x time points).
        target_length (int): The desired number of time points for each patient's data.
        Returns:
        np.array: A 3D array of shape (patients, channels, target_length).
    """
    padded_data = []
    for patient_data in eeg_data:
        num_channels, orig_length = patient_data.shape
        if orig_length < target_length:
            padding = np.zeros((num_channels, target_length - orig_length))
            padded_data.append(np.hstack((patient_data, padding)))

        else:
            padded_data.append(patient_data)
    return np.array(padded_data)

def generate_dataset(data_list, labels, subject_ids, sfreq=128):
    """
    Args:
        data_list: List of numpy arrays, each shape (channels, time)
        labels: List or array of group labels
        subject_ids: List or array of subject identifiers. In your case, this should just be the first column of the label mapping CSV file.
        sfreq: Sampling frequency
    """
    X_rbp_list = []
    X_scc_list = []
    y_list = []
    groups_list = []

    window_samples = 30 * sfreq
    step_samples = 15 * sfreq

    for data, label, s_id in zip(data_list, labels, subject_ids):

        n_points = data.shape[1]

        # Sliding Window
        for start in range(0, n_points - window_samples + 1, step_samples):
            epoch = data[:, start : start + window_samples]

            rbp, scc = extract_features(epoch, sfreq)

            X_rbp_list.append(rbp)
            X_scc_list.append(scc)
            y_list.append(label)
            groups_list.append(s_id)

    X_rbp = torch.tensor(np.array(X_rbp_list), dtype=torch.float32)
    X_scc = torch.tensor(np.array(X_scc_list), dtype=torch.float32)
    y = torch.tensor(np.array(y_list), dtype=torch.float32).unsqueeze(1)
    groups = np.array(groups_list)

    return X_rbp, X_scc, y, groups