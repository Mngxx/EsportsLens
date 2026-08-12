from unittest.mock import patch

import pytest
from src.api import DOTA_API_URL
from src.dota import (
    get_hero_stats,
    get_heroes,
    get_heroes_matchups,
    get_match_details,
    get_player_data,
    get_player_recent_matches,
    get_pro_matches,
    get_pro_players,
    get_top_players,
)


def test_get_heroes_success():
    fake_response = [{"id": 123, "name": "sticky"}]
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_heroes()

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/heroes")
    assert result == fake_response


def test_get_heroes_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_heroes()

    assert result is None


def test_get_heroes_matchups_success():
    fake_response = [{"hero_id": 123, "games_played": 1, "wins": 9}]
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_heroes_matchups(123)

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/heroes/123/matchups")
    assert result == fake_response


def test_get_heroes_matchups_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_heroes_matchups(123)

    assert result is None


def test_get_hero_stats_success():
    fake_response = [{"hero_id": 1, "pick_rate": 0.12, "win_rate": 0.51}]
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_hero_stats()

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/heroStats")
    assert result == fake_response


def test_get_hero_stats_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_hero_stats()

    assert result is None


def test_get_match_details_success():
    fake_response = {"match_id": 123456789, "duration": 1879}
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_match_details(123456789)

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/matches/123456789")
    assert result == fake_response


def test_get_match_details_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_match_details(123456789)

    assert result is None


def test_get_player_recent_matches_success():
    fake_response = {"match_id": 345, "radiant_win": True}
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_player_recent_matches(5678)

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/players/5678/recentMatches")
    assert result == fake_response


def test_get_player_recent_matches_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_player_recent_matches(5678)

    assert result is None


def test_get_player_data_success():
    fake_response = {"rank_tier": 7, "leaderboard_rank": 2324}
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_player_data(5678)

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/players/5678")
    assert result == fake_response


def test_get_player_data_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_player_data(5678)

    assert result is None


def test_get_pro_players_success():
    fake_response = {"account_id": 5678, "team_name": "RookieTeam"}
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_pro_players()

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/proPlayers")
    assert result == fake_response


def test_get_pro_players_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_pro_players()

    assert result is None


def test_get_top_players_success():
    fake_response = {"account_id": 5678, "team_name": ""}
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_top_players()

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/topPlayers")
    assert result == fake_response


def test_get_top_players_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_top_players()

    assert result is None


def test_get_pro_matches_success():
    fake_response = [{"match_id": 123, "radiant_win": True}]
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        result = get_pro_matches()

    mock_safe_get.assert_called_once_with(f"{DOTA_API_URL}/proMatches/", params={})
    assert result == fake_response


def test_get_pro_matches_failure_returns_none():
    with patch("src.dota.safe_get", return_value=None):
        result = get_pro_matches()

    assert result is None


@pytest.mark.parametrize(
    ("less_than_match_id", "expected_params"),
    [
        (None, {}),
        (123, {"less_than_match_id": 123}),
    ],
)
def test_get_pro_matches_builds_correct_params(less_than_match_id, expected_params):
    fake_response = [{"match_id": 122, "radiant_win": True}]
    with patch("src.dota.safe_get", return_value=fake_response) as mock_safe_get:
        get_pro_matches(less_than_match_id)

    mock_safe_get.assert_called_once_with(
        f"{DOTA_API_URL}/proMatches/", params=expected_params
    )
