import numpy as np
import matplotlib.pyplot as plt
from signal import # give signal class
from dsp_demoduation import Demodulate
from config import *

class SignalProc:

    # initialization variables

    def __init__(self):
        self.demod = Demodulate()

    def fft(self, iq, sample_rate):
        """
        Performs Fast Fourier transform on the automotive data.
        """

        fft = np.fft.fftshift(np.fft.fft(iq))

        freqs = np.fft.fftshift(
            np.fft.fftfreq(len(iq), d=1/sample_rate)
        )

        power = 20 * np.log10(np.abs(fft) + 1e-12)

        return freqs, power, fft
    

    def remove_dc(self, iq):
        """
        Remove the DC offset from complex IQ samples.
        """
        return iq - np.mean(iq)
    
    
    def filter(self, data, sample_rate, filter_type, 
               cutoff=None, low_cutoff=None, high_cutoff=None):
        """
        Enables filtering depending on data received.
        """

        fft_data = np.fft.fftshift(np.fft.fft(data))

        frequencies = np.fft.fftshift(
            np.fft.fftfreq(len(data), d=1/sample_rate)
        )

        if filter_type is None:
            return data

        filter_type = filter_type.lower().replace("-", "")
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

    def spectrum_analysis(self, iq, sample_rate, title="Automotive Data"):
        """
        Plots data recieved from the HackRF.
        """

        freqs, power, _ = self.fft(iq, sample_rate)

        plt.figure(figsize=(10,5))
        plt.plot(freqs/1e6, power)
        plt.title(title)
        plt.xlabel("Frequency (MHz)")
        plt.ylabel("Power (dB)")
        plt.grid(True)
        plt.show()

    def signal_power(self, iq):
        """
        Calculate the average signal power.
        """

        return np.mean(np.abs(iq)**2)
    
    def signal_power_db(self, iq):
        """
        Signal Power in decibles.
        """

        power = np.mean(np.abs(iq)**2)
        return 10 * np.log10(power + 1e-12)

    def detect_packet(self, iq, threshold):
        """
        Detect whether a packet is present.
        """

        power = self.signal_power(iq)
        return power > threshold

    def estimate_noise(self, iq):
        """
        Estimates the amount of noise being produced.
        """

        return np.mean(np.abs(iq))
    
    def demodulate_call(self, iq):
        demod = Demodulate()
        ask_dm = self.demod.ask_demod(iq)
        fsk_dm = self.demod.fsk_demod(iq)

        return ask_dm, fsk_dm