import json

def to_dict(self):
    """
    Convert the HackRF object's data into a dictionary.
    """

    return {
        "frequency": self.frequency,
        "sample_rate": self.sample_rate,
        "rf_amplify_enable": self.RF_amplify_enable,
        "board_ID": getattr(self, "board_ID", None),
        "model_name": getattr(self, "model_name", None),
        "version": getattr(self, "version", None),
        "serial": getattr(self, "serial", None)
    }

def writeJson(self, fileName="hack.json"):
     with open(fileName, "w") as outfile:
            json.dump(self.to_dict(), outfile, indent=4)

if __name__ == "__main__":
     

