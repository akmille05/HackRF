import matplotlib.pyplot as plt
import numpy as np

def plot_fft(frequencies, power):
    """
    Plot FFT power spectrum.
    """

    plt.figure(figsize=(10, 5))

    plt.plot(frequencies / 1e6, power)

    plt.title("FFT Spectrum")
    plt.xlabel("Frequency (MHz)")
    plt.ylabel("Power (dB)")
    plt.grid(True)

    plt.show()

def plot_constellation(iq):
    """
    Plot IQ constellation.
    """

    plt.figure(figsize=(6, 6))

    plt.scatter(
        np.real(iq),
        np.imag(iq),
        s=2
    )

    plt.title("Constellation Diagram")
    plt.xlabel("In-Phase")
    plt.ylabel("Quadrature")

    plt.grid(True)
    plt.axis("equal")

    plt.show()

def plot_waveform(iq):
    """
    Plot received waveform.
    """

    plt.figure(figsize=(10, 4))

    plt.plot(np.abs(iq))

    plt.title("Signal Amplitude")
    plt.xlabel("Sample")
    plt.ylabel("Amplitude")

    plt.grid(True)

    plt.show()

def plot_spectrum(frequencies, spectrum):
    """
    Plot processed spectrum.
    """

    plt.figure(figsize=(10, 5))

    plt.plot(
        frequencies / 1e6,
        spectrum
    )

    plt.title("Spectrum")
    plt.xlabel("Frequency (MHz)")
    plt.ylabel("Magnitude (dB)")

    plt.grid(True)

    plt.show()
