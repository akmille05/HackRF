import numpy as np
from scipy import signal
import matplotlib.pyplot as plt


class SignalProc:

    REST_FREQUENCY = 1420.40575177e6 

    SAMPLE_RATE = 2e6

    FFT_SIZE = 16384

    def __init__(self):
        """
        Initialize signal processing parameters.
        """

        self.sample_rate = 2_000_000
        self.fft_size = 4096
        self.window_type = "hann"
        self.averaging = 10
        self.smoothing_window = 5

        self.iq_samples = None
        self.frequencies = None
        self.fft_data = None
        self.power_spectrum = None
        self.noise_floor = None

    def frequency_resolution(self):
        return self.sample_rate / self.fft_size

    def remove_dc(self, iq):
        return iq - np.mean(iq)

    def normalize(self, iq):
        return iq / np.max(np.abs(iq))

    def apply_window(self, iq):
        """
        Applies the selected window function to the IQ samples before
        performing an FFT.

        Parameters
        ----------
        iq : np.ndarray
            Complex IQ samples.

        Returns
        -------
        np.ndarray
            Windowed IQ samples.
        """

        windows = {
            "hann": signal.windows.hann,
            "hamming": signal.windows.hamming,
            "blackman": signal.windows.blackman,
            "blackmanharris": signal.windows.blackmanharris,
        }

        window_name = self.window_type.lower()

        if window_name not in windows:
            raise ValueError(f"Unsupported window type: {self.window_type}")

        window = windows[window_name](len(iq))


    def fft(self, iq):
        """
        Perform a Fast Fourier Transform on the input data.
        """
        fft = np.fft.fftshift(np.fft.fft(iq))

        power = 20*np.log10(np.abs(fft) + 1e-12)

        frequencies = np.fft.fftshift(
            np.fft.fftfreq(len(iq), d=1/self.sample_rate)
        )

    def ifft(self, fft_data):
        return np.fft.ifft(np.fft.ifftshift(fft_data))

    def frequency_axis(self):
        return np.fft.fftshift(
        np.fft.fftfreq(
            self.fft_size,
            d=1 / self.sample_rate
        )
    )

    def power_spectrum(self, fft, power):
        power = 20*np.log10(np.abs(fft)+1e-12)
        return power

    def average_spectrum(self, spectra):
        return np.mean(np.asarray(spectra), axis=0)

    def integrate(self, spectra):
        return np.sum(np.asarray(spectra), axis=0)

    def decimate(self, iq, factor):
        return signal.decimate(iq, factor, ftype="fir")

    def resample(self, iq, new_sample_rate):
        num_samples = int(len(iq) * new_sample_rate / self.sample_rate)
        return signal.resample(iq, num_samples)

    def iq_correction(self, iq):
        i = np.real(iq)
        q = np.imag(iq)

        i = i - np.mean(i)
        q = q - np.mean(q)

        i /= np.std(i)
        q /= np.std(q)

        return i + 1j * q

    def estimate_noise(self, spectrum):
        return np.std(spectrum)

    def snr(self, noise_std, peak, noise_mean):
        if noise_std == 0:
            return 0

        return (peak - noise_mean) / noise_std

    def smooth(self, spectrum):
        kernel = np.ones(self.smoothing_window)

        kernel /= self.smoothing_window

        return np.convolve(spectrum, kernel, mode="same")

    def baseline_remove(self, spectrum):
        return spectrum - np.mean(spectrum)