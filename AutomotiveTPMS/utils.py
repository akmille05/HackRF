import numpy as np


def bits_to_bytes(bits):
    """
    Convert a list of bits into bytes.

    Parameters
    ----------
    bits : list[int]

    Returns
    -------
    bytes
    """

    if len(bits) % 8 != 0:
        raise ValueError("Bit list length must be a multiple of 8.")

    byte_array = bytearray()

    for i in range(0, len(bits), 8):

        byte = 0

        for bit in bits[i:i + 8]:
            byte = (byte << 1) | bit

        byte_array.append(byte)

    return bytes(byte_array)


def bytes_to_hex(data):
    """
    Convert bytes into a hexadecimal string.

    Parameters
    ----------
    data : bytes

    Returns
    -------
    str
    """

    return data.hex().upper()


def hex_to_bits(hex_string):
    """
    Convert a hexadecimal string into a list of bits.

    Parameters
    ----------
    hex_string : str

    Returns
    -------
    list[int]
    """

    bits = []

    for character in hex_string:

        value = int(character, 16)

        for shift in [3, 2, 1, 0]:
            bits.append((value >> shift) & 1)

    return bits


def moving_average(data, window_size=5):
    """
    Smooth data using a moving average.

    Parameters
    ----------
    data : array-like

    window_size : int

    Returns
    -------
    numpy.ndarray
    """

    kernel = np.ones(window_size) / window_size

    return np.convolve(data, kernel, mode="same")


def normalize(data):
    """
    Normalize data between 0 and 1.

    Parameters
    ----------
    data : array-like

    Returns
    -------
    numpy.ndarray
    """

    data = np.asarray(data)

    minimum = np.min(data)

    maximum = np.max(data)

    if maximum == minimum:
        return np.zeros_like(data)

    return (data - minimum) / (maximum - minimum)


def find_edges(data, threshold):
    """
    Find rising edges above a threshold.

    Parameters
    ----------
    data : array-like

    threshold : float

    Returns
    -------
    list[int]
    """

    edges = []

    for i in range(1, len(data)):

        if data[i - 1] < threshold and data[i] >= threshold:
            edges.append(i)

    return edges