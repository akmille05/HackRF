import sqlite3

DATABASE_NAME = "hackrf.db"


def create_database():
    connection = sqlite3.connect(DATABASE_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS captures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            frequency REAL,
            sample_rate REAL,
            fft_size INTEGER,
            duration REAL,
            signal_power REAL,
            noise_floor REAL,
            snr REAL,
            peak_frequency REAL,
            packet_detected INTEGER,
            packet_data TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_capture(
    frequency,
    sample_rate,
    fft_size,
    duration,
    signal_power,
    noise_floor,
    snr,
    peak_frequency,
    packet_detected,
    packet_data
):
    connection = sqlite3.connect(DATABASE_NAME)
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO captures (
            frequency,
            sample_rate,
            fft_size,
            duration,
            signal_power,
            noise_floor,
            snr,
            peak_frequency,
            packet_detected,
            packet_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        frequency,
        sample_rate,
        fft_size,
        duration,
        signal_power,
        noise_floor,
        snr,
        peak_frequency,
        packet_detected,
        packet_data
    ))

    connection.commit()
    connection.close()

if __name__ == "__main__":
    create_database()