from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch
from db.athena import AthenaQueryError
from tests.conftest import (
    make_dota2_top_player_row,
    make_lol_top_player_row,
    make_dota2_most_picked_row,
    make_lol_most_picked_row,
)

client = TestClient(app)


def test_get_dota2_dashboard_summary():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [
            [{"matches_today": 5}],
            [
                make_dota2_top_player_row(account_id=3456, avg_kda=4.5),
                make_dota2_top_player_row(account_id=7890, avg_kda=3.8),
            ],
            [make_dota2_most_picked_row(hero_id=6, pick_count=15)],
        ]
        response = client.get("dashboard/dota2/summary")
        assert response.status_code == 200
        assert response.json() == {
            "matches_today": 5,
            "top_players_by_kda": [
                make_dota2_top_player_row(account_id=3456, avg_kda=4.5),
                make_dota2_top_player_row(account_id=7890, avg_kda=3.8),
            ],
            "most_picked_hero": make_dota2_most_picked_row(
                hero_id=6, pick_count=15
            ),
        }
        assert mock_run_query.call_count == 3


def test_get_dota2_dashboard_summary_empty_window():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [
            [{"matches_today": 0}],
            [],
            [],
        ]
        response = client.get("dashboard/dota2/summary")
        assert response.status_code == 200
        assert response.json() == {
            "matches_today": 0,
            "top_players_by_kda": [],
            "most_picked_hero": None,
        }


def test_get_dota2_dashboard_summary_no_matches_today_rows():
    # matches_today query returns zero rows at all (not just count=0) — the
    # `if matches_today else 0` guard should handle this without IndexError.
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [[], [], []]
        response = client.get("dashboard/dota2/summary")
        assert response.status_code == 200
        assert response.json()["matches_today"] == 0


def test_get_dota2_dashboard_summary_athena_failure():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("dashboard/dota2/summary")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}


def test_get_lol_dashboard_summary():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [
            [{"matches_today": 3}],
            [
                make_lol_top_player_row(puuid="puuid-xyz-789", avg_kda=3.2),
                make_lol_top_player_row(puuid="puuid-abc-456", avg_kda=2.9),
            ],
            [
                make_lol_most_picked_row(
                    champion_id=157, champion_name="Yasuo", pick_count=20
                )
            ],
        ]
        response = client.get("dashboard/lol/summary")
        assert response.status_code == 200
        assert response.json() == {
            "matches_today": 3,
            "top_players_by_kda": [
                make_lol_top_player_row(puuid="puuid-xyz-789", avg_kda=3.2),
                make_lol_top_player_row(puuid="puuid-abc-456", avg_kda=2.9),
            ],
            "most_picked_champion": make_lol_most_picked_row(
                champion_id=157, champion_name="Yasuo", pick_count=20
            ),
        }
        assert mock_run_query.call_count == 3


def test_get_lol_dashboard_summary_empty_window():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [
            [{"matches_today": 0}],
            [],
            [],
        ]
        response = client.get("dashboard/lol/summary")
        assert response.status_code == 200
        assert response.json() == {
            "matches_today": 0,
            "top_players_by_kda": [],
            "most_picked_champion": None,
        }


def test_get_lol_dashboard_summary_no_matches_today_rows():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = [[], [], []]
        response = client.get("dashboard/lol/summary")
        assert response.status_code == 200
        assert response.json()["matches_today"] == 0


def test_get_lol_dashboard_summary_athena_failure():
    with patch("routes.dashboard.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query abc123 finished with state: FAILED"
        )
        response = client.get("dashboard/lol/summary")
        assert response.status_code == 502
        assert response.json() == {
            "details": "Query abc123 finished with state: FAILED"
        }
