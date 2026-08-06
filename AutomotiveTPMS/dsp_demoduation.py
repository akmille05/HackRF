# This will be dsp demodulation file that extracts the baseband bits
import numpy as np
from config import *


class Demodulate:
    def fsk_demod(self, iq):
        """
        FM/FSK demodulation using phase difference.
        """

        return np.angle(iq[1:] * np.conj(iq[:-1]))
    
    def ask_demod(self, iq):
        """
        ASK/OOK demodulation.
        """

        return np.abs(iq)