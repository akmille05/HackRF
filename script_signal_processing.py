from signal import signal

from numpy import power

from basicHackRF import HackRF
from signal_processing import Signal

def main():
    """
    Test the HackRF class methods.
    """ 
    signal = Signal()

    signal.signal_processing() 

    iq_samples = signal.iq_processing()

    freqs, power, fft_data = signal.FFT(iq_samples, 10e6)

    print(freqs[:10])
    print(power[:10])
    filtered = signal.filter(iq_samples, 10e6, "lowpass", cutoff=150e3)
    print("Filter:", filtered)
    fm = signal.demodulate(filtered, "FM")
    print("Demodulator:", fm)
    spec_analysis = signal.spectrum_analysis(filtered, 10e6, "lowpass")
    print("Spectrum Analysis:", spec_analysis)

if __name__ == "__main__":
    main()