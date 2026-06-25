from python_hackrf import pyhackrf
pyhackrf.pyhackrf_init()


class HackRF:

    sdr: pyhackrf
    frequency: int
    sample_rate: int
    LNA_gain: int
    VGA_gain: int
    RF_amplify_enable: int

    def __init__(self):
        self.sdr = pyhackrf.pyhackrf_open() 
        self.frequency = 100e6
        self.sample_rate = 0
        # self.LNA_gain = 0
        # self.VGA_gain = 0  
        self.RF_amplify_enable = False

    def devInfo(self):

        board_ID, model_name = self.sdr.pyhackrf_board_id_read()
        version = self.sdr.pyhackrf_version_string_read()
        serial = self.sdr.pyhackrf_board_partid_serialno_read()

        line = f"Board ID: {board_ID}, Model: {model_name}, Version: {version}, Serial: {serial}"
        return line
        
    # def send_command(self,command):
    #     if command  == "version":
    #         return self.sdr.pyhackrf_version_string_read()
    #     elif command == "serial":
    #         return self.sdr.pyhackrf_board_partid_serialno_read()
    #     elif command == "board_ID":
    #         return self.sdr.pyhackrf_board_id_read()[0]
    #     elif command == "model_name":
    #         return self.sdr.pyhackrf_board_id_read()[1]
    #     else: 
    #         return "Unknown command"

    # def query_result(self):
    #     result = self.send_command("getfreq")
    #     line = f"Query result: {result}"
    #     return line
    def __del__(self):
        self.sdr.pyhackrf_close()

    # Write getters and setters for the config variables

    def getFrequency(self):
        return self.frequency

    def setFrequency(self, frequency):
        self.send_command("frequency")

    def getSampleRate(self):
        return self.sample_rate

    def setSampleRate(self, sample_rate):
        self.send_command("sample_rate")

    # def getLNA_gain(self):
    #     return self.LNA_gain

    # def setLNA_gain(self, LNA_gain):
    #     self.send_command("LNA_gain")

    # def getVGA_gain(self):
    #     return self.VGA_gain

    # def setVGA_gain(self, VGA_gain):
    #     self.send_command("VGA_gain")

    def getRF_amplify_enable(self):
        return self.RF_amplify_enable

    def setRF_amplify_enable(self, RF_amplify_enable):
        self.sdr.pyhackrf_set_antenna_enable(bool)