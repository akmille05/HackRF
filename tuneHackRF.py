"""
Tuning and listening script for the HackRF.

This script tunes the HackRF to a desired frequency and
allows the user to listen to the signal received by the
HackRF.
"""

from python_hackrf import pyhackrf
from basicHackRF import HackRF
import time
import numpy as np

pyhackrf.pyhackrf_init()

callback_count = 0

def rx_callback(device, buffer, buffer_length, valid_length):
    """
    Runs automatically whenever the HackRF receives samples.
    """

    raw = buffer[:valid_length]

    i_samples = raw[0::2]
    q_samples = raw[1::2]

    iq_samples = i_samples + 1j * q_samples

    audio = demodulate_fm(iq_samples)

    print("Audio samples:", len(audio))

    return 0

def demodulate_fm(iq_samples):
    """
    Convert IQ samples into FM audio samples.
    """

    angles = np.angle(iq_samples[1:] * np.conj(iq_samples[:-1]))

    return angles

def main():
    # Connect to the HackRF
    sdr = HackRF()

    # Configure the radio
    sdr.setFrequency(99500000)      # 99.5 MHz
    sdr.setSampleRate(10000000)     # 10 MHz
    sdr.setRF_amplify_enable(False)

    print('Tuned to:', sdr.getFrequency())
    print("With a sample rate of ", sdr.getSampleRate())

    # Start receiving samples
    sdr.sdr.set_rx_callback(rx_callback) #tells the HackRF which function to call
    sdr.sdr.pyhackrf_start_rx() #starts receiving

    #print("Receiving for 5 seconds...")
    #time.sleep(5)

    print("Receiving samples...")
    print("Press Ctrl + C to stop.")

    try:
        while True:
            time.sleep(1)

    except KeyboardInterrupt: #Ctrl C stops the loop
        print("Stopping receive...")

    sdr.sdr.pyhackrf_stop_rx() #stops receiving
    print("Stopped receiving.")

    # Play the audio
    # ...

    # Keep running until the user quits
    # ...


if __name__ == "__main__":
    main()