from python_hackrf import pyhackrf
pyhackrf.pyhackrf_init()


class HackRF:
    """
    A wrapper class for interacting with a HackRF SDR.

    This class provides methods to connect to a HackRF device, retrieve
    device information, and gather info about frequency, sample rate, and RF amplifier state.
    """
    sdr: pyhackrf
    frequency: int
    sample_rate: int
    RF_amplify_enable: bool
    version: str
    serial: str
    board_ID: int
    model_name: str

    def __init__(self):
        """
        Initialize a HackRF and set config values.

        Opens a connection to  HackRF device and
        initializes config values.
        """
        self.sdr = pyhackrf.pyhackrf_open() 
        self.frequency = 100e6
        self.sample_rate = 0
        self.RF_amplify_enable = False

    def devInfo(self):
        """
        Retrieve information about HackRF.

        Returns:
            str: A formatted string containing the board ID, model name,
                 firmware version, and serial number.
        """
        board_ID, model_name = self.sdr.pyhackrf_board_id_read()
        version = self.sdr.pyhackrf_version_string_read()
        serial = self.sdr.pyhackrf_board_partid_serialno_read()

        self.board_ID = board_ID
        self.model_name = model_name
        self.version = version
        self.serial = serial

        line = f"Board ID: {board_ID}, Model: {model_name}, Version: {version}, Serial: {serial}"
        print(line)
        
    def __del__(self):
        """
        Close the connection to HackRF.

        Called automatically when the object is destroyed.
        """
        self.sdr.pyhackrf_close()

    # Write getters and setters for the config variables

    def getFrequency(self):
        """
        Get the frequency.

        Returns:
            int: The configured frequency in Hz.
        """
        return self.frequency

    def setFrequency(self, frequency):
        """
        Set the center frequency.

        Args:
            frequency (int): Desired frequency in Hz.
        """
        self.frequency = frequency

    def getSampleRate(self):
        """
        Get the configured sample rate.

        Returns:
            int: The sample rate in samples per second.
        """
        return self.sample_rate

    def setSampleRate(self, sample_rate):
        """
        Set the sample rate.

        Args:
            sample_rate (int): Desired sample rate in samples per second.
        """
        self.sample_rate = sample_rate

    def getRF_amplify_enable(self):
        """
        Get the RF amplifier enable status.

        Returns:
            bool: True if the RF amplifier is enabled, False otherwise.
        """
        return self.RF_amplify_enable

    def setRF_amplify_enable(self, RF_amplify_enable):
        """
        Set the RF amplifier enable status.

        Args:
            RF_amplify_enable (bool): True to enable the RF amplifier, False to disable it.
        """
        self.RF_amplify_enable = RF_amplify_enable
        self.sdr.pyhackrf_set_antenna_enable(bool)