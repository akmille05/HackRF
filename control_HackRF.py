from basicHackRF import HackRF
from signal_processing import Signal
from tuneHackRF import Tune
import wave


hackrf = HackRF()
signal = Signal()

hackrf.setFrequency(...)
sample_rate = hackrf.setSampleRate(2400000)

iq = hackrf.receiveSamples(10)

freqs, power, fft = signal.FFT(iq, sample_rate)

filtered = signal.filter(
    iq,
    sample_rate,
    "lowpass",
    cutoff=100000
)

audio = signal.demodulate(filtered, "FM")

Tune.save_wav(audio)