# HackRF

A Python-based project that interfaces with a HackRF Software Defined Radio (SDR) on Linux to capture RF signals, analyze them, and convert them into audible audio.

The program connects to a HackRF device, captures IQ samples, performs signal processing techniques such as the Fast Fourier Transform (FFT) and frequency-domain filtering, demodulates the selected signal, and exports the resulting audio to a `.wav` file for playback.

This project also includes a UI interface where the collected data can be used in a visual display to the user. The user can toggle what they would like included in the spectrum (FFT, amplifyed spectrum, and filtering (which includes a drop down of what filters can be applied to the dataset))

Our UI is able access 3 seperate projects, the Classic HackRF connection interface, named Basic in our UI, An Automotive TPMS (Tire Pressure Monitoring System) interface, and a Radio Astronomy Hydrogen Line interface.

Our UI also includes a settings page, which has editable changes to the UI such as light/dark mode, enlarged text, and high contrast for a more accessibility friendly interface for users.

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
- Demodulates RF signals into audio (FM/AM)
- Saves the demodulated signal as a `.wav` file
- Modular signal processing classes for easy expansion
- JavaScript Live Server UI
   - Basic HackRF interface
   - Automotive TPMS (Tire Pressure Monitoring System) interface
   - Radio Astronomy Hydrogen Line interface
   - Settings page for accessibility
- Pulls data from the HackRf in given context 

---

## Project Structure

```
.
├── AutomotiveTPMS
   ├── config.py
   ├── crc.py
   ├── decodesignal.py
   ├── dsp_demoduation.py
   ├── logger.py
   ├── MainAuto.py
   ├── packet.py
   ├── signal_processing.py
   ├── signal.py
   ├── tpms_decoding_signal.py
   ├── utils.py
   ├── visualization.py
├── Data
   ├── database.py
├── Radio Astronomy
   ├── calibration.py
   ├── data_logger.py
   ├── demodulate_signal.py
   ├── hydrogen_line.py
   ├── observation.py
   ├── signal_processing.py
   ├── test_values.py
├── Sketches
   ├── api.py
   ├── automotive_tpms.html
   ├── automotive_tpms.js
   ├── automotive_tpms1.js
   ├── basic.html
   ├── basic.js
   ├── hackdata.json
   ├── p5_example.js
   ├── radio_astronomy.html
   ├── radio_astronomy.js
   ├── settings.html
   ├── settings.js
   ├── titlepage.js
├── basicHackRF.py        # HackRF interface
├── basicHackTest.py
├── signal_processing.py  # FFT, filtering, and demodulation
├── tuneHackRF.py         # Gets the signal and saves as a .wav
├── cline_interaction.py  # Creates a CLI that lets the user capture RF data 
├── testhackrf.py         # Local testing file for basicHackRF.py
├── script_basicHackRF.py # Runs basicHackRF.py
├── script_signal_processing.py  # Runs signal_processing.py
├── Proj1.py
├── pysdr_web_code.py     # Pysdr reference code
├── theme.js
├── pysdr_web_code # Reference code we used
├── Proj1.py
├── hackrf.db             # Database to store our code
├── hackrf_data.json      # File with generic data for testing
├── hackdata.json         # File with FM radio data for testing
├── grc_bridge.py
├── gnu_radio_integration.py
├── control_HackRF.py
├── cline_interaction.py
├── station_spectrum.png
├── waterfall.png
├── captured_iq.npy
├── iq_samples.png
├── CHANGELOG.md          # Log for all changes
└── README.md
├── requirements.txt
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

## Signal Processing Pipeline

The HackRF project is organized as a processing pipeline that captures
radio-frequency data, processes the signal, decodes application-specific
information, stores selected results, and sends data to the frontend.

```text
┌─────────────────────────────┐
│      HackRF Capture         │
│                             │
│  Capture IQ Samples         │
│  Tune Frequency             │
│  Set Sample Rate            │
│  Set Gain                   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Signal Processing      │
│                             │
│  FFT                        │
│  Filtering                  │
│  Demodulation               │
│  Noise Estimation           │
│  Signal Analysis            │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐ ┌────────────────────┐
│     TPMS     │ │  Radio Astronomy   │
│    Decode    │ │      Decode        │
│              │ │                    │
│ CRC          │ │ Hydrogen Line      │
│ Packet       │ │ Calibration        │
│ Decode       │ │ Velocity            │
└──────┬───────┘ └──────────┬─────────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │   Database Storage  │
       │                     │
       │     SQLite          │
       │     hackrf.db       │
       │                     │
       │  Capture Metadata   │
       │  Signal Results     │
       │  Decoded Packets    │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │     API Bridge      │
       │                     │
       │    Sketches/api.py  │
       │                     │
       │   Python → JSON     │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │    Frontend Pages   │
       │                     │
       │   Basic             │
       │   Automotive TPMS   │
       │   Radio Astronomy   │
       │                     │
       │        p5.js        │
       └─────────────────────┘

## Usage

Connect the HackRF and run

```bash
python script_basicHackRF.py
python script_signal_processing.py
```

---

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
 |               * * *      *
 |            ***   ***.   * *
 |______*_____*_______*___*___*__ Frequency
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

FM/AM are the radio signals that can be measured.

---

## Future Improvements

- Real-time spectrum display
- Waterfall visualization element
- More demodualtion choices
- Ai agent integration 
   - Identification of the strongest signal
   - UI agent chat
   - Pull real-time data agentically
- Incorporate the toggled data saving with the established SQLite database

---