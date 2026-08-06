import numpy as np
from scipy import signal


class Calibration:
    """
    Calibration methods for radio astronomy spectra.
    """

    def measure_noise_floor(self, spectrum):
        return np.median(spectrum)

    def remove_baseline(self, spectrum, window=101):
        baseline = signal.savgol_filter(spectrum, window, 3)

        corrected = spectrum - baseline

        return corrected

    def calibrate_gain(self, spectrum, gain):
        if gain <= 0:
            return spectrum

        return spectrum / gain

    def normalize_temperature(self, spectrum, reference):
        return spectrum / (reference + 1e-12)