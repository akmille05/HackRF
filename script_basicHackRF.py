"""
Test script for the HackRF wrapper class.

This script creates a HackRF object and verifies that the
device information, getter functions, and setter functions
operate correctly.
"""

from basicHackRF import HackRF

def main():
    """
    Test the HackRF class methods.
    """ 

    sdr = HackRF()

    #Testing Device Info Function.
    print("Device Info:", sdr.devInfo())

    #Testing the Getter Functions.
    print("Frequency:", sdr.getFrequency())
    print("RF Amplifier Enabled:", sdr.getRF_amplify_enable())
    print("Sample Rate:", sdr.getSampleRate())

    #Testing the Setter Functions.
    sdr.setFrequency(915000000) #915 MHz
    print("Updated Frequency:", sdr.getFrequency())
    sdr.setRF_amplify_enable(True)
    print("Update RF Amplify Enable:", sdr.getRF_amplify_enable())
    sdr.setSampleRate(10000000) #10 MHz
    print("Updated Sample Rate:", sdr.getSampleRate())

if __name__ == "__main__":
    main()