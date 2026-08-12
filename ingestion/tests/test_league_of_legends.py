from unittest.mock import patch

import pytest
from src.league_of_legends import (
    build_api_url,
    get_challenger_leagues,
    get_match_details,
    get_personal_match_list,
    get_puuid,
    get_rank_by_puuid,
)

API_URL = "https://asia.api.riotgames.com/"
TEST_HEADERS = {"X-Riot-Token": "test-key"}


@pytest.mark.parametrize(
    ("region", "expected_url"),
    [
        ("asia", "https://asia.api.riotgames.com/"),
        ("na", "https://na.api.riotgames.com/"),
        ("korea", "https://korea.api.riotgames.com/"),
    ],
)
def test_build_api_url_builds_correct_url(region, expected_url):
    assert build_api_url(region) == expected_url


def test_get_puuid_success():
    fake_response = {
        "puuid": "asdrewfdc123",
        "gameName": "game_name1",
        "tagLine": "#sample",
    }
    with (
        patch(
            "src.league_of_legends.safe_get", return_value=fake_response
        ) as mock_safe_get,
        patch("src.league_of_legends.HEADERS", TEST_HEADERS),
    ):
        result = get_puuid("asia", "game_name1", "sample")

    mock_safe_get.assert_called_once_with(
        f"{API_URL}riot/account/v1/accounts/by-riot-id/game_name1/sample",
        headers=TEST_HEADERS,
    )
    assert result == fake_response["puuid"]


def test_get_puuid_failure_returns_none():
    with patch("src.league_of_legends.safe_get", return_value=None):
        result = get_puuid("asia", "game_name1", "sample")

    assert result is None


def test_get_match_details_success():
    fake_response = {"metadata": {"matchId": "aersg456"}, "info": {"gameId": 123456}}

    with (
        patch(
            "src.league_of_legends.safe_get", return_value=fake_response
        ) as mock_safe_get,
        patch("src.league_of_legends.HEADERS", TEST_HEADERS),
    ):
        result = get_match_details("asia", "aersg456")

    mock_safe_get.assert_called_once_with(
        f"{API_URL}lol/match/v5/matches/aersg456",
        headers=TEST_HEADERS,
    )
    assert result == fake_response


def test_get_match_details_failure_returns_none():
    with patch("src.league_of_legends.safe_get", return_value=None):
        result = get_match_details("asia", "aersg456")

    assert result is None


def test_get_personal_match_list_success():
    fake_response = ["a1", "b2", "c3"]

    with (
        patch(
            "src.league_of_legends.safe_get", return_value=fake_response
        ) as mock_safe_get,
        patch("src.league_of_legends.HEADERS", TEST_HEADERS),
    ):
        result = get_personal_match_list("asia", "puuid1")

    mock_safe_get.assert_called_once_with(
        f"{API_URL}lol/match/v5/matches/by-puuid/puuid1/ids",
        headers=TEST_HEADERS,
    )
    assert result == fake_response


def test_get_personal_match_list_failure_returns_none():
    with patch("src.league_of_legends.safe_get", return_value=None):
        result = get_personal_match_list("asia", "puuid1")

    assert result is None


def test_get_personal_match_list_empty_list_is_preserved():
    with patch("src.league_of_legends.safe_get", return_value=[]):
        result = get_personal_match_list("asia", "puuid1")
    assert result == []


def test_get_challenger_leagues_success():
    fake_response = {"leagueId": "league1", "entries": [{"puuid": "puuid1"}]}

    with (
        patch(
            "src.league_of_legends.safe_get", return_value=fake_response
        ) as mock_safe_get,
        patch("src.league_of_legends.HEADERS", TEST_HEADERS),
    ):
        result = get_challenger_leagues("asia", "RANKED_SOLO")

    mock_safe_get.assert_called_once_with(
        f"{API_URL}lol/league/v4/challengerleagues/by-queue/RANKED_SOLO",
        headers=TEST_HEADERS,
    )
    assert result == fake_response


def test_get_challenger_leagues_failure_returns_none():
    with patch("src.league_of_legends.safe_get", return_value=None):
        result = get_challenger_leagues("asia", "RANKED_SOLO")

    assert result is None


def test_get_rank_by_puuid_success():
    fake_response = [{"puuid": "puuid1", "wins": 5}]
    with (
        patch(
            "src.league_of_legends.safe_get", return_value=fake_response
        ) as mock_safe_get,
        patch("src.league_of_legends.HEADERS", TEST_HEADERS),
    ):
        result = get_rank_by_puuid("asia", "puuid1")

    mock_safe_get.assert_called_once_with(
        f"{API_URL}lol/league/v4/entries/by-puuid/puuid1",
        headers=TEST_HEADERS,
    )
    assert result == fake_response


def test_get_rank_by_puuid_failure_returns_none():
    with patch("src.league_of_legends.safe_get", return_value=None):
        result = get_rank_by_puuid("asia", "puuid1")

    assert result is None


def test_get_rank_by_puuid_empty_list_is_preserved():
    with patch("src.league_of_legends.safe_get", return_value=[]):
        result = get_rank_by_puuid("asia", "puuid1")
    assert result == []
