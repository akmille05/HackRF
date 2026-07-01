# Will include our unit tests

import unittest
from unittest.mock import MagicMock, patch

from basicHackRF import HackRF


class TestHackRF(unittest.TestCase):
    def setUp(self):
        self.mock_sdr = MagicMock()

        self.mock_sdr.pyhackrf_board_id_read.return_value = (2, "HackRF One")
        self.mock_sdr.pyhackrf_version_string_read.return_value = "2024.02.1"
        self.mock_sdr.pyhackrf_board_partid_serialno_read.return_value = "0000000000000001"

        self.patcher = patch("basicHackRF.pyhackrf.pyhackrf_open", return_value=self.mock_sdr)

        self.patcher.start()
        self.hackrf = HackRF()

    def tearDown(self):
        self.patcher.stop()


    def test_initialization(self):
        self.assertEqual(self.hackrf.frequency, 100e6)
        self.assertEqual(self.hackrf.sample_rate, 0)
        self.assertFalse(self.hackrf.RF_amplify_enable)



    def test_get_frequency(self):
        self.hackrf.frequency = 915000000
        self.assertEqual(self.hackrf.getFrequency(), 915000000)


    def test_set_frequency(self):
        self.hackrf.setFrequency(433920000)
        self.assertEqual(self.hackrf.frequency, 433920000)


    def test_get_sample_rate(self):
        self.hackrf.sample_rate = 2000000
        self.assertEqual(self.hackrf.getSampleRate(), 2000000)


    def test_set_sample_rate(self):
        self.hackrf.setSampleRate(10000000)
        self.assertEqual(self.hackrf.sample_rate, 10000000)


    def test_get_rf_amplifier(self):
        self.hackrf.RF_amplify_enable = True
        self.assertTrue(self.hackrf.getRF_amplify_enable())


    def test_set_rf_amplifier(self):
        self.hackrf.setRF_amplify_enable(True)

        self.assertTrue(self.hackrf.RF_amplify_enable)
        self.mock_sdr.pyhackrf_set_antenna_enable.assert_called_once()


    def test_device_info(self):
        info = self.hackrf.devInfo()

        self.assertEqual(self.hackrf.board_ID, 2)
        self.assertEqual(self.hackrf.model_name, "HackRF One")
        self.assertEqual(self.hackrf.version, "2024.02.1")
        self.assertEqual(self.hackrf.serial, "0000000000000001")

        self.assertIn("Board ID: 2", info)
        self.assertIn("HackRF One", info)
        self.assertIn("2024.02.1", info)


    def test_destructor(self):
        self.hackrf.__del__()
        self.mock_sdr.pyhackrf_close.assert_called_once()

if __name__ == "__main__":
    unittest.main()