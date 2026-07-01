from basicHackRF import HackRF
from signal_processing import Signal

def main():
    """
    Test the HackRF class methods.
    """ 
    fft = Signal()


    iq_samples = [1, 2, 3]

    print("Fast Fourier Transform:", fft.FFT(iq_samples, 10e6))
    print("Filter:", fft.filter(iq_samples, 10e6, 150))
    print("Demodulator:", fft.demodulate(iq_samples, "FM"))
    #print("Spectrum Analysis:", fft.spectrum_analysis())
    #print("IQ Processing:", fft.iq_processing())

if __name__ == "__main__":
    main()