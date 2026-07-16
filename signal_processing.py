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

    iq_samples: int

    def signal_processing(self):
        hackrf = HackRF()

        hackrf.setFrequency(100e6)
        hackrf.setSampleRate(10e6)

        hackrf.devInfo()
        self.iq_samples = hackrf.receiveSamples(262144)

    def recieveSamples(self):
        return self.iq_samples
    
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

        return frequencies, power, fft

    def filter(self, data, sample_rate, filter_type,
           cutoff=None, low_cutoff=None, high_cutoff=None):

        fft_data = np.fft.fftshift(np.fft.fft(data))

        frequencies = np.fft.fftshift(
            np.fft.fftfreq(len(data), d=1/sample_rate)
        )

        if filter_type == "lowpass":
            if cutoff is None:
                raise ValueError("Low-pass filter requires cutoff.")
            mask = np.abs(frequencies) <= cutoff

        elif filter_type == "highpass":
            if cutoff is None:
                raise ValueError("High-pass filter requires cutoff.")
            mask = np.abs(frequencies) >= cutoff

        elif filter_type == "bandpass":
            if low_cutoff is None or high_cutoff is None:
                raise ValueError("Band-pass filter requires high and low cutoffs.")
            mask = (
                (np.abs(frequencies) >= low_cutoff) &
                (np.abs(frequencies) <= high_cutoff)
            )

        elif filter_type == "bandstop":
            if low_cutoff is None or high_cutoff is None:
                raise ValueError("Band-stop filter requires high and low cutoffs.")
            mask = (
                (np.abs(frequencies) < low_cutoff) |
                (np.abs(frequencies) > high_cutoff)
            )
        else:
            raise ValueError("Invalid filter type.")

        fft_data *= mask

        filtered = np.fft.ifft(np.fft.ifftshift(fft_data))

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

    def spectrum_analysis(self, data, sample_rate, filter_type):
        """
        Perform a spectrum analysis on the input data.
        """
        filtered = self.filter(data, sample_rate, filter_type)
        freqs, power, _ = self.FFT(filtered, sample_rate)

        plt.figure(figsize=(10, 5))
        plt.plot(freqs / 1e6, power)
        plt.xlabel("Frequency (MHz)")
        plt.ylabel("Power (dB)")
        plt.title("Spectrum")
        plt.grid(True)
        plt.show()


    def graphs(self, data, sample_rate):

        filters = [
            ("Original", None),
            ("Low Pass", "lowpass"),
            ("High Pass", "highpass"),
            ("Band Pass", "bandpass"),
            ("Band Stop", "bandstop")
        ]
        for title, filter_type in filters:
            if filter_type is None:
                filtered = data

            elif filter_type == "lowpass":
                filtered = self.filter(
                    data,
                    sample_rate,
                    "lowpass",
                    cutoff=500e3
                )

            elif filter_type == "highpass":
                filtered = self.filter(
                    data,
                    sample_rate,
                    "highpass",
                    cutoff=500e3
                )

            elif filter_type == "bandpass":
                filtered = self.filter(
                    data,
                    sample_rate,
                    "bandpass",
                    low_cutoff=200e3,
                    high_cutoff=800e3
                )

            elif filter_type == "bandstop":
                filtered = self.filter(
                    data,
                    sample_rate,
                    "bandstop",
                    low_cutoff=200e3,
                    high_cutoff=800e3
                )

            freqs, power, _ = self.FFT(filtered, sample_rate)

            plt.figure(figsize=(10,5))
            plt.plot(freqs/1e6, power)
            plt.title(title)
            plt.xlabel("Frequency (MHz)")
            plt.ylabel("Power (dB)")
            plt.grid(True)

        plt.show()

    def iq_processing(self, data):
        """
        Process the input data as I/Q samples.
        """
        # Placeholder for IQ processing implementation

        self.signal_processing()

        iq = np.asarray(self.iq_samples)

        iq = iq - np.mean(iq)

        return iq
