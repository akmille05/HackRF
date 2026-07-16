"""
FM radio recording script for the HackRF.

This script tunes the HackRF to an FM station, records IQ samples,
FM demodulates them, and saves the result as a WAV file.
"""

from python_hackrf import pyhackrf
from basicHackRF import HackRF
import time
import numpy as np
import wave

recording_time = 10          # seconds
station_freq = 103700000    # Desired FM station frequency in Hz
center_freq = station_freq + 200000        # Tune HackRF 200 kHz above station
sample_rate = 2400000        # 2.4 MHz
audio_rate = 48000           # WAV audio sample rate
decimation = 50              # 2,400,000 / 48,000 = 50

num_samples = int(recording_time * sample_rate)
samples = np.zeros(num_samples, dtype=np.complex64)
last_idx = 0


def rx_callback(device, buffer, buffer_length, valid_length):
    """
    Receive HackRF IQ samples and store them in the samples array.
    """

    global samples, last_idx

    accepted = valid_length // 2

    raw = buffer[:valid_length].astype(np.float32)

    iq = raw[0::2] + 1j * raw[1::2]
    iq = iq / 128.0

    end_idx = last_idx + accepted

    if end_idx <= len(samples):
        samples[last_idx:end_idx] = iq
        last_idx = end_idx

    return 0

def demodulate_fm(iq_samples):
    """
    FM demodulate complex IQ samples.
    """

    return np.angle(iq_samples[1:] * np.conj(iq_samples[:-1]))


def fm_deemphasis(audio, sample_rate=48000, tau=75e-6):
    """
    Apply FM de-emphasis for U.S. broadcast FM.
    """

    dt = 1.0 / sample_rate
    alpha = dt / (tau + dt)

    output = np.zeros_like(audio)

    for i in range(1, len(audio)):
        output[i] = output[i - 1] + alpha * (audio[i] - output[i - 1])

    return output

def save_wav(filename, audio):
    """
    Save audio samples to a WAV file.
    """

    audio = audio - np.mean(audio)

    max_value = np.max(np.abs(audio))
    if max_value > 0:
        audio = audio / max_value

    audio_int16 = np.int16(audio * 32767)

    with wave.open(filename, "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(audio_rate)
        wav_file.writeframes(audio_int16.tobytes())
    
def low_pass_filter(signal, cutoff, sample_rate, num_taps=201):
    """
    Apply a low-pass FIR filter using NumPy.

    Args:
        signal: Real or complex input samples.
        cutoff: Frequencies above this value are reduced.
        sample_rate: Current sample rate in samples per second.
        num_taps: Length of the FIR filter.

    Returns:
        Filtered samples.
    """
    positions = np.arange(num_taps) - (num_taps - 1) / 2

    taps = (
        2 * cutoff / sample_rate
        * np.sinc(2 * cutoff * positions / sample_rate)
    )

    taps *= np.hamming(num_taps)
    taps /= np.sum(taps)

    return np.convolve(signal, taps, mode="same")

def shift_frequency(iq_samples, frequency_shift, sample_rate):
    """
    Digitally shift IQ samples by a specified frequency.

    Args:
        iq_samples: Complex IQ samples.
        frequency_shift: Frequency shift in Hz.
        sample_rate: IQ sample rate in samples per second.

    Returns:
        Frequency-shifted IQ samples.
    """
    sample_numbers = np.arange(len(iq_samples))

    oscillator = np.exp(
        -1j * 2 * np.pi * frequency_shift
        * sample_numbers / sample_rate
    )

    return iq_samples * oscillator

def main():
    global samples, last_idx

    pyhackrf.pyhackrf_init()

    sdr = HackRF()

    sdr.setFrequency(center_freq)
    sdr.setSampleRate(sample_rate)
    sdr.setRF_amplify_enable(False)

    sdr.sdr.pyhackrf_set_baseband_filter_bandwidth(1750000)
    sdr.sdr.pyhackrf_set_amp_enable(False)
    sdr.sdr.pyhackrf_set_lna_gain(24)
    sdr.sdr.pyhackrf_set_vga_gain(40)

    print("Station frequency:", station_freq)
    print("HackRF center frequency:", sdr.getFrequency())
    print("Sample rate:", sdr.getSampleRate())

    sdr.sdr.set_rx_callback(rx_callback)

    print("Recording...")
    sdr.sdr.pyhackrf_start_rx()

    time.sleep(recording_time)

    sdr.sdr.pyhackrf_stop_rx()
    print("Stopped recording.")

    #pyhackrf.pyhackrf_exit()

    samples = samples[:last_idx]

    # Remove first samples because HackRF can have startup transients
    samples = samples[100000:]

    print("Samples recorded:", len(samples))


    import matplotlib.pyplot as plt

    # Save the captured IQ data for debugging.
    np.save("captured_iq.npy", samples)

    # Plot the frequency spectrum of the recording.
    fft_size = min(262144, len(samples))
    block = samples[:fft_size]

    window = np.hanning(fft_size)
    spectrum = np.fft.fftshift(np.fft.fft(block * window))
    power = 20 * np.log10(np.abs(spectrum) + 1e-12)

    frequencies = np.fft.fftshift(
        np.fft.fftfreq(fft_size, d=1 / sample_rate)
    )

    plt.figure()
    plt.plot((center_freq + frequencies) / 1e6, power)
    plt.xlabel("Frequency (MHz)")
    plt.ylabel("Power (dB)")
    plt.title("Spectrum near the tuned frequency")
    plt.grid()
    plt.savefig("station_spectrum.png")
    plt.close()

    print("Saved station_spectrum.png")




    # The station's position relative to the HackRF center frequency.
    frequency_offset = station_freq - center_freq

    # Move the desired station to the center of the IQ recording.
    samples = shift_frequency(
        samples,
        frequency_offset,
        sample_rate
    )

    # Isolate one broadcast-FM channel.
    channel_iq = low_pass_filter(
        samples,
        cutoff=100000,       # Keep about ±100 kHz around the station
        sample_rate=sample_rate,
        num_taps=201
    )

    # Reduce 2.4 MHz to 240 kHz.
    channel_iq = channel_iq[::10]
    channel_rate = 240000

    # FM-demodulate only the isolated station.
    audio = demodulate_fm(channel_iq)

    # Keep audible mono frequencies below approximately 15 kHz.
    audio = low_pass_filter(
        audio,
        cutoff=15000,
        sample_rate=channel_rate,
        num_taps=201
    )

    # Reduce 240 kHz to 48 kHz.
    audio = audio[::5]

    # Apply U.S. broadcast-FM de-emphasis.
    audio = fm_deemphasis(audio, audio_rate)

    save_wav("radio.wav", audio)

    print("Saved audio to radio.wav")

if __name__ == "__main__":
    main()