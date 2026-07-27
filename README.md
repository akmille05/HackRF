# HackRF

A Python-based project that interfaces with a HackRF Software Defined Radio (SDR) on Linux to capture RF signals, analyze them, and convert them into audible audio.

The program connects to a HackRF device, captures IQ samples, performs signal processing techniques such as the Fast Fourier Transform (FFT) and frequency-domain filtering, demodulates the selected signal, and exports the resulting audio to a `.wav` file for playback.

---

## Features

- Connects to a HackRF One using Python
- Configures center frequency and sample rate
- Captures IQ samples from the SDR
- Computes a Fast Fourier Transform (FFT)
- Displays the frequency spectrum
- Applies digital filters
    - Low-pass
    - High-pass
    - Band-pass
    - Band-stop
- Demodulates RF signals into audio
- Saves the demodulated signal as a `.wav` file
- Modular signal processing classes for easy expansion

---

## Project Structure

```
.
├── basicHackRF.py        # HackRF interface
├── signal_processing.py  # FFT, filtering, and demodulation
├── tuneHackRF.py         # Gets the signal and saves as a .wav
├── cline_interaction.py  # Creates a CLI that lets the user capture RF data 
├── testhackrf.py         # Local testing file for basicHackRF.py
├── script_basicHackRF.py # Runs basicHackRF.py
├── script_signal_processing.py  # Runs signal_processing.py
├── radio.wav             # Generated audio
├── Proj1.py
├── pysdr_web_code.py     # Pysdr reference code
├── station_spectrum.png
├── waterfall.png
├── captured_iq.npy
├── iq_samples.png
├── CHANGELOG.md          # Log for all changes
└── README.md
```

---

## Requirements

- Linux
- Python 3.10+
- HackRF One
- libhackrf
- python_hackrf
- NumPy
- SciPy
- Matplotlib

Install Python packages:

```bash
requirements.tx
```

---

## How It Works

The signal processing pipeline is:

```
HackRF
   │
   ▼
Capture IQ Samples
   │
   ▼
Fast Fourier Transform (FFT)
   │
   ▼
Frequency Spectrum Plot
   │
   ▼
Frequency Filter
   │
   ▼
Demodulation
   │
   ▼
Audio Samples
   │
   ▼
output.wav
```

---

## Usage

Connect the HackRF and run

```bash
python script_basicHackRF.py
python script_signal_processing.py
```

Example:

```python
hackrf = HackRF()

hackrf.setFrequency(100e6)
hackrf.setSampleRate(10e6)

iq = hackrf.receiveSamples(262144)

freq, power, fft = signal.FFT(iq, 10e6)

filtered = signal.filter(
    iq,
    sample_rate=10e6,
    filter_type="bandpass",
    low_cutoff=99.9e6,
    high_cutoff=100.1e6,
)

audio = demod.demodulate(filtered)

demod.save_audio(audio, "output.wav")
```

---

## Example Output

FFT spectrum:

```
Center Frequency: 100 MHz

Power (dB)

 ^
 |
 |                 *
 |               * * *
 |            ***   ***
 |___________*_______*________ Frequency
```

Generated audio:

```
radio.wav
```

can be played with

```bash
aplay radio.wav
```

or

```bash
ffplay radio.wav
```

---

## Signal Processing

### FFT

The FFT converts time-domain IQ samples into the frequency domain, allowing the received RF spectrum to be visualized.

### Filtering

Filtering removes unwanted frequencies before demodulation.

Supported filters:

- Low-pass
- High-pass
- Band-pass
- Band-stop

### Demodulation

The filtered RF signal is demodulated into an audio signal that can be written to a WAV file and played back.

---

## Future Improvements

- Real-time spectrum display
- Waterfall visualization
- SSB demodulation
- Automatic station detection
- GUI interface
- Recording IQ data to disk
- Live audio playback

---