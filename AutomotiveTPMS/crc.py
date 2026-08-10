class CRC:
    """
    Utility class for calculating and verifying CRC values.
    """

    @staticmethod
    def calculate_crc8(data,
                       polynomial=0x07,
                       initial_value=0x00):
        """
        Calculate an 8-bit CRC.

        Parameters
        ----------
        data : bytes
            Packet bytes excluding the CRC byte.

        polynomial : int
            CRC polynomial.

        initial_value : int
            Initial CRC value.

        Returns
        -------
        int
            Calculated CRC.
        """

        crc = initial_value

        for byte in data:

            crc ^= byte

            for _ in range(8):

                if crc & 0x80:
                    crc = ((crc << 1) ^ polynomial) & 0xFF
                else:
                    crc = (crc << 1) & 0xFF

        return crc

    @staticmethod
    def verify_crc(data,
                   received_crc,
                   polynomial=0x07):
        """
        Verify packet CRC.

        Parameters
        ----------
        data : bytes
            Packet data without CRC.

        received_crc : int
            CRC received in the packet.

        Returns
        -------
        bool
        """

        calculated = CRC.calculate_crc8(
            data,
            polynomial
        )

        return calculated == received_crc