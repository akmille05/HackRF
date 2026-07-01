from basicHackRF import HackRF
from signal_processing import Signal

def main():
    """
    Test the HackRF class methods.
    """ 
    fft = Signal

    print("Fast Fourier Transform:", fft.FFT())
    print("Filter:", fft.filter())
    print("Demodulator:", fft.demodulate())
    print("Spectrum Analysis:", fft.spectrum_analysis())
    print("IQ Processing:", fft.iq_processing())

if __name__ == "__main__":
    main()