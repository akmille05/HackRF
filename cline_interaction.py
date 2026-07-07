from signal import Signal


def main():
    signal = Signal()

    print("===================================")
    print(" HackRF Signal Processing Tool")
    print("===================================")

    # Collect IQ samples
    signal.signal_processing()

    data = signal.iq_samples
    sample_rate = 10e6

    while True:
        print("\nChoose an option:")
        print("1. FFT Spectrum")
        print("2. Low-pass Filter")
        print("3. High-pass Filter")
        print("4. Band-pass Filter")
        print("5. Band-stop Filter")
        print("6. Show All Graphs")
        print("7. FM Demodulation")
        print("8. AM Demodulation")
        print("9. Exit")

        choice = input("> ")

        if choice == "1":
            freqs, power, _ = signal.FFT(data, sample_rate)
            signal.spectrum_analysis(data, sample_rate, "lowpass")  # Or create a method for the original FFT

        elif choice == "2":
            signal.spectrum_analysis(data, sample_rate, "lowpass")

        elif choice == "3":
            signal.spectrum_analysis(data, sample_rate, "highpass")

        elif choice == "4":
            signal.spectrum_analysis(data, sample_rate, "bandpass")

        elif choice == "5":
            signal.spectrum_analysis(data, sample_rate, "bandstop")

        elif choice == "6":
            signal.graphs(data, sample_rate)

        elif choice == "7":
            demod = signal.demodulate(data, "FM")
            print(f"FM demodulated {len(demod)} samples.")

        elif choice == "8":
            demod = signal.demodulate(data, "AM")
            print(f"AM demodulated {len(demod)} samples.")

        elif choice == "9":
            print("Goodbye!")
            break

        else:
            print("Invalid option.")


if __name__ == "__main__":
    main()