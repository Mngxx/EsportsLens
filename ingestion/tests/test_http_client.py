from unittest.mock import Mock, patch

import requests
from src.http_client import safe_get


def test_safe_get_success():
    mock_response = Mock()
    mock_response.ok = True
    mock_response.json.return_value = {"key": "value"}

    with patch(
        "src.http_client.requests.get", return_value=mock_response
    ) as mock_requests_get:
        result = safe_get(
            "https://sample.game",
            headers={"X-Riot-Token": "test-key"},
            params={"count": 5},
        )

    mock_requests_get.assert_called_once_with(
        "https://sample.game",
        headers={"X-Riot-Token": "test-key"},
        params={"count": 5},
    )
    assert result == {"key": "value"}


def test_safe_get_non_ok_status_returns_none():
    mock_response = Mock()
    mock_response.ok = False
    mock_response.status_code = 404

    with patch("src.http_client.requests.get", return_value=mock_response):
        result = safe_get("https://sample.game")

    assert result is None


def test_safe_get_request_exception_returns_none():
    with patch(
        "src.http_client.requests.get",
        side_effect=requests.exceptions.ConnectionError("boom"),
    ):
        result = safe_get("https://sample.game")

    assert result is None
