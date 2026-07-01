"""
Tuning and listening script for the HackRF.

This script tunes the HackRF to a desired frequency and
allows the user to listen to the signal received by the
HackRF.
"""

from python_hackrf import pyhackrf
from basicHackRF import HackRF
import time

pyhackrf.pyhackrf_init()

def rx_callback(transfer):
    """
    Runs automatically whenever the HackRF receives samples.
    """
    print("Received samples")
    return 0

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

    print("Receiving for 5 seconds...")
    time.sleep(5)

    sdr.sdr.pyhackrf_stop_rx() #stops receiving
    print("Stopped receiving.")

    # Demodulate FM
    # ...

    # Play the audio
    # ...

    # Keep running until the user quits
    # ...


if __name__ == "__main__":
    main()