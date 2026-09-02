from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch
from src.db.athena import AthenaQueryError
from tests.conftest import make_dota2_match_row, make_lol_match_row

client = TestClient(app)


def test_get_dota2_matches():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_dota2_match_row(account_id=3456, team="radiant", win=True, hero_id=6),
            make_dota2_match_row(account_id=45678, team="dire", win=False, hero_id=14),
        ]
        response = client.get("matches/dota2/123")
        assert response.status_code == 200
        assert response.json() == [
            make_dota2_match_row(account_id=3456, team="radiant", win=True, hero_id=6),
            make_dota2_match_row(account_id=45678, team="dire", win=False, hero_id=14),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE match_id = 123"
        )


def test_get_dota2_matches_no_results():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("matches/dota2/999")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE match_id = 999"
        )


def test_get_dota2_matches_athena_failure():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("matches/dota2/123")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE match_id = 123"
        )


def test_get_lol_matches():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_lol_match_row(
                puuid="puuid-xyz-789", team_id=100, win=True, champion_id=157
            ),
            make_lol_match_row(
                puuid="puuid-abc-456", team_id=200, win=False, champion_id=238
            ),
        ]
        response = client.get("matches/lol/abc123")
        assert response.status_code == 200
        assert response.json() == [
            make_lol_match_row(
                puuid="puuid-xyz-789", team_id=100, win=True, champion_id=157
            ),
            make_lol_match_row(
                puuid="puuid-abc-456", team_id=200, win=False, champion_id=238
            ),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE match_id = 'abc123'"
        )


def test_get_lol_matches_no_results():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("matches/lol/999")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE match_id = '999'"
        )


def test_get_lol_matches_athena_failure():
    with patch("src.routes.matches.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query abc123 finished with state: FAILED"
        )
        response = client.get("matches/lol/abc123")
        assert response.status_code == 502
        assert response.json() == {
            "details": "Query abc123 finished with state: FAILED"
        }
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE match_id = 'abc123'"
        )


def test_get_lol_matches_invalid_match_id_rejected():
    with patch("src.routes.matches.run_query") as mock_run_query:
        response = client.get("matches/lol/abc'; DROP TABLE--")
        assert response.status_code == 422
        mock_run_query.assert_not_called()
