"""
Tuning and listening script for the HackRF.

This script tunes the HackRF to a desired frequency and
allows the user to listen to the signal received by the
HackRF.
"""

from curses import raw

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

    raw = buffer[:valid_length].astype(np.float32)

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

def fm_deemphasis(audio, sample_rate=48000, tau=75e-6):
    """
    Apply FM de-emphasis to reduce harsh high-frequency noise.
    """
    dt = 1.0 / sample_rate
    alpha = dt / (tau + dt)

    output = np.zeros_like(audio)

    for i in range(1, len(audio)):
        output[i] = output[i - 1] + alpha * (audio[i] - output[i - 1])

    return output

def main():
    # Connect to the HackRF
    sdr = HackRF()

    # Configure the radio
    sdr.setFrequency(106700000)      # 200 kHz above 106.5 MHz
    sdr.setSampleRate(2400000)     # 2.4 MHz
    sdr.setRF_amplify_enable(False)
    sdr.sdr.pyhackrf_set_baseband_filter_bandwidth(1750000)
    sdr.sdr.pyhackrf_set_lna_gain(24)
    sdr.sdr.pyhackrf_set_vga_gain(20)

    print('Tuned to:', sdr.getFrequency())
    print("With a sample rate of ", sdr.getSampleRate())

    # Start receiving samples
    sdr.sdr.set_rx_callback(rx_callback) #tells the HackRF which function to call
    sdr.sdr.pyhackrf_start_rx() #starts receiving

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

    # Remove DC offset
    audio = audio - np.mean(audio)

    # Simple low-pass filter using a moving average
    filter_size = 50
    kernel = np.ones(filter_size) / filter_size
    audio = np.convolve(audio, kernel, mode="same")

    # Downsample from 2.4 MHz to 48 kHz
    audio = audio[::50]

    #de-emphasis
    audio = fm_deemphasis(audio, 48000)

    # Normalize audio so it is not too quiet or too loud
    max_value = np.max(np.abs(audio))

    if max_value > 0:
        audio = audio / max_value


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