class TPMSPacket:

    def __init__(self,
                 sensor_id,
                 pressure,
                 temperature,
                 battery,
                 checksum):

        self.sensor_id = sensor_id
        self.pressure = pressure
        self.temperature = temperature
        self.battery = battery
        self.checksum = checksum

    def __str__(self):

        return (
            f"Sensor {self.sensor_id}\n"
            f"Pressure: {self.pressure} psi\n"
            f"Temperature: {self.temperature} C\n"
            f"Battery: {self.battery}"
        )