# Will include our pytests

import pytest
from unittest.mock import MagicMock, patch

from basicHackRF import HackRF


@pytest.fixture
def mock_sdr():
    """Create a fake HackRF device."""
    sdr = MagicMock()

    sdr.pyhackrf_board_id_read.return_value = (2, "HackRF One")
    sdr.pyhackrf_version_string_read.return_value = "2024.02.1"
    sdr.pyhackrf_board_partid_serialno_read.return_value = "0000000000000001"

    return sdr


@pytest.fixture
def hackrf(mock_sdr):
    """Create a HackRF object using the mocked SDR."""
    with patch("basicHackRF.pyhackrf.pyhackrf_open", return_value=mock_sdr):
        radio = HackRF()
        yield radio


def test_initialization(hackrf):
    """Test constructor initializes default values."""
    assert hackrf.frequency == 100e6
    assert hackrf.sample_rate == 0
    assert hackrf.RF_amplify_enable is False


def test_get_frequency(hackrf):
    hackrf.frequency = 915000000
    assert hackrf.getFrequency() == 915000000


def test_set_frequency(hackrf):
    hackrf.setFrequency(433920000)
    assert hackrf.frequency == 433920000


def test_get_sample_rate(hackrf):
    hackrf.sample_rate = 2000000
    assert hackrf.getSampleRate() == 2000000


def test_set_sample_rate(hackrf):
    hackrf.setSampleRate(10000000)
    assert hackrf.sample_rate == 10000000


def test_get_rf_amplifier(hackrf):
    hackrf.RF_amplify_enable = True
    assert hackrf.getRF_amplify_enable() is True


def test_set_rf_amplifier(hackrf, mock_sdr):
    hackrf.setRF_amplify_enable(True)

    assert hackrf.RF_amplify_enable is True
    mock_sdr.pyhackrf_set_antenna_enable.assert_called_once()


def test_device_info(hackrf):
    info = hackrf.devInfo()

    assert hackrf.board_ID == 2
    assert hackrf.model_name == "HackRF One"
    assert hackrf.version == "2024.02.1"
    assert hackrf.serial == "0000000000000001"

    assert "Board ID: 2" in info
    assert "HackRF One" in info
    assert "2024.02.1" in info


def test_destructor(mock_sdr):
    with patch("basicHackRF.pyhackrf.pyhackrf_open", return_value=mock_sdr):
        radio = HackRF()

    radio.__del__()

    mock_sdr.pyhackrf_close.assert_called_once()