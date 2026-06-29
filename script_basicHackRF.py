from basicHackRF import HackRF

def main():
    sdr = HackRF()
    print(sdr.devInfo())
    print(sdr.getFrequency())
    print(sdr.getRF_amplify_enable())
    print(sdr.getSampleRate())

if __name__ == "__main__":
    main()