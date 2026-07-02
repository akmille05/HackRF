# What we could build to track signal processing capabilities

# FFT's
# Filtering
# Demodulation
# spectrum Analysis 
# IQ processing

import numpy as np
import matplotlib.pyplot as plt
from basicHackRF import HackRF


class Signal:

    iq_samples : int

    def signal_processing(self):
        hackrf = HackRF()

        hackrf.setFrequency(100e6)
        hackrf.setSampleRate(10e6)

        hackrf.devInfo()
        self.iq_samples = hackrf.receiveSamples(262144)


    def recieveSamples(self, sample_number):
        return self.sample_number
    
    def setSamp_num(self, sample_number):
        self.iq_samples = sample_number

    def FFT(self, iq_samples, sample_rate):
        """
        Perform a Fast Fourier Transform on the input data.
        """
        fft = np.fft.fftshift(np.fft.fft(iq_samples))

        power = 20*np.log10(np.abs(fft) + 1e-12)

        frequencies = np.fft.fftshift(
            np.fft.fftfreq(len(iq_samples), d=1/sample_rate)
        )

        return frequencies, power     

    def filter(self, data, sample_rate, cutoff):
        """
        Filter the input data with a low-pass filter.
        """
        fft = np.fft.fftshift(np.fft.fft(data))

        freqs = np.fft.fftshift(
            np.fft.fftfreq(len(data), d=1/sample_rate)
        )

        # Keep only frequencies within the cutoff
        fft[np.abs(freqs) > cutoff] = 0

        # Convert back to the time domain
        filtered = np.fft.ifft(np.fft.ifftshift(fft))

        return filtered

    def demodulate(self, data, mode):
        """
        Demodulate the input data with the specified mode.
        """
        if mode == "FM":
            return np.angle(data[1:] * np.conj(data[:-1]))
        elif mode == "AM":
            return np.abs(data)
        else:
            raise ValueError(f"Unsupported demodulation mode: {mode}")

    def spectrum_analysis(self, data, sample_rate):
        """
        Perform a spectrum analysis on the input data.
        """
        #Placeholder for spectrum analysis implementation
        freqs, power = Signal.FFT(self, data, sample_rate)

        plt.figure(figsize=(10, 5))
        plt.plot(freqs / 1e6, power)

        plt.xlabel("Frequency (MHz)")
        plt.ylabel("Power (dB)")
        plt.title("Spectrum")
        plt.grid(True)
        plt.show()

    def iq_processing(self, data):
        """
        Process the input data as I/Q samples.
        """
        # Placeholder for IQ processing implementation

        return self.iq_samples