import numpy as np

sample_rate = 2e6
samples = 262144

# Time vector
t = np.arange(samples) / sample_rate

# Background receiver noise
noise = np.random.normal(0, 1, samples)

# Weak hydrogen-like signal
signal = 0.05 * np.cos(2 * np.pi * 250000 * t)

# Simulated IQ data
iq = noise + signal

# Complex Samples
noise_i = np.random.normal(0, 1, samples)
noise_q = np.random.normal(0, 1, samples)

iq = noise_i + 1j * noise_q

iq += 0.05 * np.exp(1j * 2 * np.pi * 250000 * t)

# Hydrogen Spectral Line
frequency = np.linspace(-1e6, 1e6, 4096)

noise = np.random.normal(0, 0.5, len(frequency))

hydrogen = 5 * np.exp(-(frequency / 50000)**2)

power = noise + hydrogen

# Simulate Multiple Observations
average = np.zeros(4096)

for _ in range(200):
    noise = np.random.normal(0, 0.5, 4096)
    hydrogen = 5 * np.exp(-(frequency / 50000)**2)

    average += noise + hydrogen

average /= 200