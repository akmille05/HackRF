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
import wave

pyhackrf.pyhackrf_init()

audio_chunks = []
callback_count = 0

def rx_callback(device, buffer, buffer_length, valid_length):
    """
    Receive samples, demodulate FM, and store audio chunks.
    """

    raw = buffer[:valid_length]

    i_samples = raw[0::2]
    q_samples = raw[1::2]

    iq_samples = i_samples + 1j * q_samples

    audio = demodulate_fm(iq_samples)

    audio_chunks.append(audio)

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
    sdr.setFrequency(106500000)      # 106.5 MHz
    sdr.setSampleRate(2400000)     # 2.4 MHz
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

    # Combine all audio chunks into one array
    audio = np.concatenate(audio_chunks)

    # Downsample from 2.4 MHz to 48 kHz
    audio = audio[::50]

    # Normalize audio so it is not too quiet or too loud
    audio = audio / np.max(np.abs(audio))

    # Convert to 16-bit audio format
    audio_int16 = np.int16(audio * 32767)

    # Save as WAV file
    with wave.open("radio.wav", "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(48000)
        wav_file.writeframes(audio_int16.tobytes())

    print("Saved audio to radio.wav")


if __name__ == "__main__":
    main()