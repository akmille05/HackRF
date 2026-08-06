# This will be the payload parsing function that extracts the Sensor ID and data
from signal import Signal
from signal_processing import SignalProcessing
from dsp_demoduation import Demodulation
from decodesignal import decode_packet
from config import *

signal = Signal()
iq_samples = signal.get_latest_samples()

processor = SignalProcessing()

iq_samples = processor.remove_dc(iq_samples)

iq_samples = processor.filter(iq_samples)

power = processor.signal_power(iq_samples)

noise = processor.estimate_noise(iq_samples)

packet_found = processor.detect_packet(iq_samples)

demod = Demodulation()

bits = demod.demodulate(iq_samples)

decoded_packet = decode_packet(bits)

print(decoded_packet)

# return TPMSpacket class

decoded = decode_packet(bits)

payload = decoded["payload"]

received_crc = decoded["crc"]

if CRC.verify_crc(payload, received_crc):

    print("Valid packet")

    print(decoded)

else:

    print("CRC failed")
