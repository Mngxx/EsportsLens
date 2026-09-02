from fastapi.testclient import TestClient
from src.main import app
from unittest.mock import patch
from src.db.athena import AthenaQueryError
from tests.conftest import make_dota2_heroes_row, make_dota2_hero_stats_row
from tests.conftest import make_lol_champions_row, make_lol_champion_stats_row


client = TestClient(app)


def test_get_dota2_heroes():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_dota2_heroes_row(hero_id=6, name="npc_dota_hero_terrorblade"),
            make_dota2_heroes_row(hero_id=14, name="npc_dota_hero_abaddon"),
        ]
        response = client.get("meta/dota2/heroes")
        assert response.status_code == 200
        assert response.json() == [
            make_dota2_heroes_row(hero_id=6, name="npc_dota_hero_terrorblade"),
            make_dota2_heroes_row(hero_id=14, name="npc_dota_hero_abaddon"),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_heroes ORDER BY name ASC"
        )


def test_get_dota2_heroes_no_results():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("meta/dota2/heroes")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_heroes ORDER BY name ASC"
        )


def test_get_dota2_heroes_athena_failure():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("meta/dota2/heroes")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_heroes ORDER BY name ASC"
        )


def test_get_dota2_heroes_stats():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_dota2_hero_stats_row(hero_id=6, hero_name="npc_dota_hero_terrorblade"),
            make_dota2_hero_stats_row(hero_id=14, hero_name="npc_dota_hero_abaddon"),
        ]
        response = client.get("meta/dota2/heroes/stats")
        assert response.status_code == 200
        assert response.json() == [
            make_dota2_hero_stats_row(hero_id=6, hero_name="npc_dota_hero_terrorblade"),
            make_dota2_hero_stats_row(hero_id=14, hero_name="npc_dota_hero_abaddon"),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_hero_stats ORDER BY hero_name ASC"
        )


def test_get_dota2_heroes_stats_no_results():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("meta/dota2/heroes/stats")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_hero_stats ORDER BY hero_name ASC"
        )


def test_get_dota2_heroes_stats_athena_failure():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("meta/dota2/heroes/stats")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM dota2_hero_stats ORDER BY hero_name ASC"
        )


def test_get_lol_champions():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_lol_champions_row(champion_id=1, name="Anivia"),
            make_lol_champions_row(champion_id=2, name="Azir"),
        ]
        response = client.get("meta/lol/champions")
        assert response.status_code == 200
        assert response.json() == [
            make_lol_champions_row(champion_id=1, name="Anivia"),
            make_lol_champions_row(champion_id=2, name="Azir"),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champions ORDER BY name ASC"
        )


def test_get_lol_champions_no_results():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("meta/lol/champions")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champions ORDER BY name ASC"
        )


def test_get_lol_champions_athena_failure():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("meta/lol/champions")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champions ORDER BY name ASC"
        )


def test_get_lol_champions_stats():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = [
            make_lol_champion_stats_row(champion_id=1, champion_name="Anivia"),
            make_lol_champion_stats_row(champion_id=2, champion_name="Azir"),
        ]
        response = client.get("meta/lol/champions/stats")
        assert response.status_code == 200
        assert response.json() == [
            make_lol_champion_stats_row(champion_id=1, champion_name="Anivia"),
            make_lol_champion_stats_row(champion_id=2, champion_name="Azir"),
        ]
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champion_stats ORDER BY champion_name ASC"
        )


def test_get_lol_champions_stats_no_results():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.return_value = []
        response = client.get("meta/lol/champions/stats")
        assert response.status_code == 200
        assert response.json() == []
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champion_stats ORDER BY champion_name ASC"
        )


def test_get_lol_champions_stats_athena_failure():
    with patch("src.routes.meta.run_query") as mock_run_query:
        mock_run_query.side_effect = AthenaQueryError(
            "Query 123 finished with state: FAILED"
        )
        response = client.get("meta/lol/champions/stats")
        assert response.status_code == 502
        assert response.json() == {"details": "Query 123 finished with state: FAILED"}
        mock_run_query.assert_called_once_with(
            "SELECT * FROM league_of_legends_champion_stats ORDER BY champion_name ASC"
        )
