from basicHackRF import HackRF

def main():
    sdr = HackRF()
    sdr.devInfo()
    sdr.getFrequency()
    sdr.getRF_amplify_enable()
    sdr.getSampleRate()

if __name__ == "__main__":
    main()