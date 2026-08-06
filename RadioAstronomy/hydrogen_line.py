class HydrogenDetector:


    def __init__(self, center_frequency):
        self.center_frequency = center_frequency


    def find_peak(self, frequencies, spectrum):

        index = np.argmax(spectrum)

        return frequencies[index]


    def calculate_velocity(
        self,
        observed_frequency
    ):

        c = 299792458

        velocity = (
            (self.center_frequency -
             observed_frequency)
             /
             self.center_frequency
        ) * c

        return velocity