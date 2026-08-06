# decodes code from signal and converts to binary
import numpy as np
from python_hackrf import pyhackrf
from config import *

class Decoder:

    def decode_signal(self, iq):
        """
        Decode IQ samples.
        """

        amplitude = np.abs(iq)

        print("Average amplitude:", np.mean(amplitude))

        return amplitude

    def decode_am(self, iq):
        return np.abs(iq)

    def decode_fm(self, iq):
        return np.angle(iq[1:] * np.conj(iq[:-1]))