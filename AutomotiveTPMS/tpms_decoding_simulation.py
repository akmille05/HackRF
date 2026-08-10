import numpy as np
from config import *

class Simulation:
    def generate_tpms_payload(sensor_id, pressure_psi, temp_c):
        """
        Constructs a standard 7 byte TPMS payload
        """
        raw_pressure = int(pressure_psi / 0.25) & 0xFF
        raw_temp = int(temp_c + 50) & 0xFF

        payload = bytearray()
        payload.append((sensor_id >> 24) & 0xFF)
        payload.append((sensor_id >> 16) & 0xFF)
        payload.append((sensor_id >> 8) & 0xFF)
        payload.append(sensor_id & 0xFF)
        payload.append(raw_pressure)
        payload.append(raw_temp)

        checksum = 0
        for b in payload:
            checksum ^= b
        payload.append(checksum)

        return payload

    def machester_encode(data):
        """
        Encodes bytes into machester bitstring.
        """

        bitstring = ""
        for byte in data_bytes:
            for i in range(7, -1, -1):
                bit = (byte >> i) & 1
                if bit == 0:
                    bitstring += "01"
                else:
                    bitstring += "10"
        return bitstring
    
    def generate_raw_frame(sensor_id, pressure_psi, temp_c):
        """
        Assembles full packet: Preamble + machester encoded payload.
        """

        preamble = "1010101010101010"
        payload_bytes = generate_tpms_payload(sensor_id, pressure_psi, temp_c)
        encoded_payload = manchester_encode(payload_bytes)

        full_bitstream = preamble + encoded_payload

        print("---- Mock TPMS Data ----")
        print(f"Target Sensor ID: {sensor_id}")
        print(f"Target Pressure: {pressure_psi}")
        print(f"Target Temp: {temp_c}")
        print(f"Payload Bytes: {[hex(b) for b in payload_bytes]}")
        print(f"Final Bitstream: {full_bitstream}")
        print(f"Bitstream Length {len(full_bitstream)}")

        return full_bitstream
    
    def export_to_iq(bitstring, filename="spms_simulator.iq", 
                     sample_rate=1000000, baud_rate = 10000, f_dev = 5000):
        """
        Converts digital bitstream into raw FSK IQ file.
        """
        samples_per_bit = int(sample_rate/baud_rate)
        total_samples = len(bitstring) * samples_per_bit

        t = np.arrange(total_samples) / sample_rate
        phase = 0.0
        iq_samples = np.zeros(total_samples, dtype=np.complex64)

        for idx, bit in enumerate(bitstring):
            freq = f_dev if bit == '1' else -f_dev
            start_sample = idx * samples_per_bit
            end_sample = start_sample + samples_per_bit

            for s in range(start_sample, end_sample):
                phase += 2* np.pi * freq / sample_rate
                iq_samples[s] = np.exp(1j * phase)

        with open(filename, "wb") as f:
            f.write(iq_samples.tobytes())
        print(f"Successfully exported complex FSK signals to {filename}")


    if __name__ == "__main__":
        mock_id = 0x1A2B3C4Dx
        mock_pressure = 32.0 
        mock_temp = 22.0

        bits = generate_raw_frame(mock_id, mock_pressure, mock_temp)

        export_to_iq(bits)