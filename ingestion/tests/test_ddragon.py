from unittest.mock import patch

from src.api import LOL_DDRAGON_API_URL
from src.ddragon import get_champion_data, get_current_version


def test_get_current_version_success():
    fake_response = ["3.0", "2.1", "1.5"]
    with patch("src.ddragon.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_current_version()

    mock_safe_get.assert_called_once_with(f"{LOL_DDRAGON_API_URL}/api/versions.json")
    assert result == fake_response[0]


def test_get_current_version_returns_none():
    with patch("src.ddragon.safe_get", return_value=None):
        result = get_current_version()

    assert result is None


def test_get_champion_data_success():
    fake_response = {"version": "3.0", "data": {"Aatrox": {}}}
    with patch("src.ddragon.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_champion_data("3.0")

    mock_safe_get.assert_called_once_with(
        f"{LOL_DDRAGON_API_URL}/cdn/3.0/data/en_US/champion.json"
    )
    assert result == fake_response


def test_get_champion_data_returns_none():
    with patch("src.ddragon.safe_get", return_value=None):
        result = get_champion_data("3.0")

    assert result is None
