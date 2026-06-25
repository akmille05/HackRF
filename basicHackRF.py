from python_hackrf import pyhackrf
pyhackrf.pyhackrf_init()
sdr = pyhackrf.pyhackrf_open() 

class HackRF:
# find out what the config variables are
    
    frequency : int
    sample_rate : int
    LNA_gain : int
    VGA_gain : int
    RF_amplify_enable : int

    def __init__(self):
        self.frequency = 0
        self.sample_rate = 0
        self.LNA_gain = 0
        self.VGA_gain = 0  
        self.RF_amplify_enable = False


    def devInfo(self):

        board_ID, model_name = sdr.pyhackrf_board_id_read()
        version = sdr.pyhackrf_version_string_read()
        serial = sdr.pyhackrf_board_partid_serialno_read()
        print(f"Board ID: {board_ID}, Model: {model_name}, Version: {version}, Serial: {serial}")
        
    def send_command(self,command):
        if command  == "version":
            return sdr.pyhackrf_version_string_read()
        elif command == "serial":
            return sdr.pyhackrf_board_partid_serialno_read()
        elif command == "board_ID":
            return sdr.pyhackrf_board_id_read()[0]
        elif command == "model_name":
            return sdr.pyhackrf_board_id_read()[1]
        else: 
            return "Unknown command"

    def query_result(self,result):
        print(f"Query result: {result}")

    # Write getters and setters for the config variables

    def getFrequency(self):
        return self.frequency

    def setFrequency(self, frequency):
        self.frequency = frequency

    def getSampleRate(self):
        return self.sample_rate

    def setSampleRate(self, sample_rate):
        self.sample_rate = sample_rate

    def getLNA_gain(self):
        return self.LNA_gain

    def setLNA_gain(self, LNA_gain):
        self.LNA_gain = LNA_gain

    def getVGA_gain(self):
        return self.VGA_gain

    def setVGA_gain(self, VGA_gain):
        self.VGA_gain = VGA_gain

    def getRF_amplify_enable(self):
        return self.RF_amplify_enable

    def setRF_amplify_enable(self, RF_amplify_enable):
        self.RF_amplify_enable = RF_amplify_enable