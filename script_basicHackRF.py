from basicHackRF import HackRF

def main():
    #sdr = HackRF()

    #Testing Device
    # print("Device Info:", sdr.devInfo())
    # print("Frequency:", sdr.getFrequency())
    # print("RF Amplifier Enabled:", sdr.getRF_amplify_enable())
    # print("Sample Rate:", sdr.getSampleRate())
    # sdr.setFrequency(915000000) #915 MHz
    # print("Updated Frequency:", sdr.getFrequency())
    # sdr.setRF_amplify_enable(True)
    # printf("Update RF Amplify Enable:", sdr.getRF_amplify_enable())
    # sdr.setSampleRate(10000000) #10 MHz
    # print("Updated Sample Rate:", sdr.getSampleRate())

    hackrf = HackRF()

    hackrf.board_ID = 2
    hackrf.model_name = "HackRF One"
    hackrf.version = "2024.02.1"
    hackrf.serial = "123456789"

    hackrf.frequency = 103700000
    hackrf.sample_rate = 2400000
    hackrf.RF_amplify_enable = False

    hackrf.save_json()

    print("JSON written!")


if __name__ == "__main__":
    main()