from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch
from src.db.athena import AthenaQueryError
from tests.conftest import make_dota2_match_row, make_lol_match_row

client = TestClient(app)


def test_get_dota2_players():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_dota2_match_row(
                match_id="12", account_id=3456, team="radiant", win=True, hero_id=6
            ),
            make_dota2_match_row(
                match_id="543", account_id=3456, team="dire", win=False, hero_id=23
            ),
        ]
        response = client.get("players/dota2/3456/matches")
        assert response.status_code == 200
        assert response.json() == [
            make_dota2_match_row(
                match_id="12", account_id=3456, team="radiant", win=True, hero_id=6
            ),
            make_dota2_match_row(
                match_id="543", account_id=3456, team="dire", win=False, hero_id=23
            ),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE account_id = 3456 ORDER BY match_date DESC LIMIT 10"
        )


def test_get_dota2_players_no_results():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("players/dota2/3456/matches")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE account_id = 3456 ORDER BY match_date DESC LIMIT 10"
        )


def test_get_dota2_players_athena_failure():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("players/dota2/3456/matches")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_matches WHERE account_id = 3456 ORDER BY match_date DESC LIMIT 10"
        )


def test_get_lol_players():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_lol_match_row(
                match_id="abc123",
                puuid="puuid-xyz-789",
                team_id=100,
                win=True,
                champion_id=157,
            ),
            make_lol_match_row(
                match_id="abc456",
                puuid="puuid-abc-456",
                team_id=200,
                win=False,
                champion_id=238,
            ),
        ]
        response = client.get("players/lol/puuid-xyz-789/matches")
        assert response.status_code == 200
        assert response.json() == [
            make_lol_match_row(
                match_id="abc123",
                puuid="puuid-xyz-789",
                team_id=100,
                win=True,
                champion_id=157,
            ),
            make_lol_match_row(
                match_id="abc456",
                puuid="puuid-abc-456",
                team_id=200,
                win=False,
                champion_id=238,
            ),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE puuid = 'puuid-xyz-789' ORDER BY match_date DESC LIMIT 10"
        )


def test_get_lol_players_no_results():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("players/lol/puuid-xyz-789/matches")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE puuid = 'puuid-xyz-789' ORDER BY match_date DESC LIMIT 10"
        )


def test_get_lol_players_athena_failure():
    with patch("src.routes.players.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("players/lol/puuid-xyz-789/matches")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_matches WHERE puuid = 'puuid-xyz-789' ORDER BY match_date DESC LIMIT 10"
        )


def test_get_lol_players_invalid_puuid_rejected():
    with patch("src.routes.players.run_query") as mock_run_query:
        response = client.get("players/lol/abc'; DROP TABLE--/matches")
        assert response.status_code == 422
        mock_run_query.assert_not_called()


def test_get_dota2_players_invalid_account_id_rejected():
    with patch("src.routes.players.run_query") as mock_run_query:
        response = client.get("players/dota2/not-a-number/matches")
        assert response.status_code == 422
        mock_run_query.assert_not_called()


def test_get_dota2_players_limit_exceeds_max():
    with patch("src.routes.players.run_query") as mock_run_query:
        response = client.get("players/dota2/3456/matches?limit=51")
        assert response.status_code == 422
        mock_run_query.assert_not_called()


def test_get_lol_players_limit_exceeds_max():
    with patch("src.routes.players.run_query") as mock_run_query:
        response = client.get("players/lol/puuid-xyz-789/matches?limit=51")
        assert response.status_code == 422
        mock_run_query.assert_not_called()
