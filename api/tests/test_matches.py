from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch

client = TestClient(app)


def test_get_dota2_matches():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = [
            {"match_id": "123", "account_id": 3456},
            {"match_id": "123", "account_id": 45678},
        ]
        response = client.get("matches/dota2/123")
        assert response.status_code == 200
        assert response.json() == [
            {"match_id": "123", "account_id": 3456},
            {"match_id": "123", "account_id": 45678},
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE match_id = 123"
        )


def test_get_lol_matches():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = [
            {"match_id": "123", "account_id": 3456},
            {"match_id": "123", "account_id": 45678},
        ]
        response = client.get("matches/lol/123")
        assert response.status_code == 200
        assert response.json() == [
            {"match_id": "123", "account_id": 3456},
            {"match_id": "123", "account_id": 45678},
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE match_id = '123'"
        )


def test_get_dota2_matches_invalid_id():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("matches/dota2/123")
        assert response.status_code == 502
        assert response.json() == {
            "details": "Athena query failed: Invalid value '123' for column 'match_id' at index 0"
        }
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE match_id = 123"
        )


def test_get_lol_matches_invalid_id():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("matches/lol/123")
        assert response.status_code == 502
        assert response.json() == {
            "details": "Athena query failed: Invalid value '123' for column 'match_id' at index 0"
        }
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE match_id = '123'"
        )
