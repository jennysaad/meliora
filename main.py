import numpy as np
import matplotlib.pyplot as plt
import os

# Example starter code
path = '/training' # Replace with your path
data = np.load(path)

n_channels, time_points = data.shape
print(f'Number of channels: {n_channels}, Number of time_points: {time_points}')

# Visualize the sample data
fs = 500
duration = 5
max_samples = int(fs * duration)

subset_data = data[:5, :max_samples]
time = np.arange(max_samples) / fs

spacing = 100
scaling_factor = spacing / (np.std(subset_data) * 4)
scaled_data = subset_data * scaling_factor

# 3. Plotting
plt.figure(figsize=(12, 6))
offsets = np.arange(len(subset_data)) * spacing

for i in range(len(subset_data)):
    plt.plot(time, scaled_data[i] + offsets[i], linewidth=1, color='midnightblue')

# 4. Cleanup
plt.yticks(offsets, [f'CH {i+1}' for i in range(len(subset_data))])
plt.xlabel('Time (s)')
plt.title('Zoomed EEG View (First 5 Seconds)')
plt.grid(axis='y', alpha=0.3)
plt.tight_layout()

plt.show()