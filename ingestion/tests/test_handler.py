from datetime import datetime, timezone
from unittest.mock import patch

import pytest
from src.handler import (
    _fetch_and_upload_lol_match,
    build_object_key,
    ingest_dota_data,
    ingest_dota_hero_data,
    ingest_league_of_legends_data,
    ingest_lol_champions_data,
    lambda_handler,
)


@pytest.fixture
def timestamp(request):
    return datetime.now(timezone.utc)


@pytest.mark.parametrize(
    ("game", "entity", "identifier", "timestamp", "expected_key"),
    [
        (
            "dota2",
            "matches",
            "123456789",
            datetime(2026, 8, 13, 15, 30, 45, tzinfo=timezone.utc),
            "dota2/matches/year=2026/month=08/day=13/matches_123456789_20260813T153045.json",
        ),
        (
            "league_of_legends",
            "matches",
            "SG2_168099106",
            datetime(2026, 1, 5, 9, 5, 3, tzinfo=timezone.utc),
            "league_of_legends/matches/year=2026/month=01/day=05/matches_SG2_168099106_20260105T090503.json",
        ),
        (
            "dota2",
            "heroes",
            "all",
            datetime(2026, 8, 13, 15, 30, 45, tzinfo=timezone.utc),
            "dota2/heroes/year=2026/month=08/day=13/heroes_all_20260813T153045.json",
        ),
    ],
)
def test_build_object_key_builds_correct_path(
    game, entity, identifier, timestamp, expected_key
):
    assert build_object_key(game, entity, identifier, timestamp) == expected_key


def test_ingest_dota_hero_data_success():
    fake_heroes = [{"id": 1, "name": "Anti-Mage"}]
    fake_hero_stats = [{"hero_id": 1, "win_rate": 0.51}]

    with (
        patch("src.handler.get_heroes", return_value=fake_heroes),
        patch("src.handler.get_hero_stats", return_value=fake_hero_stats),
        patch("src.handler.upload_json", return_value=True) as mock_upload,
    ):
        result = ingest_dota_hero_data("my-bucket")

    assert result == {"heroes_uploaded": True, "hero_stats_uploaded": True}
    assert mock_upload.call_count == 2


def test_ingest_lol_champions_data_success():
    fake_version = "1.2"
    fake_champions = {"data": {"Aatrox": {}}}
    with (
        patch("src.handler.get_current_version", return_value=fake_version),
        patch("src.handler.get_champion_data", return_value=fake_champions),
        patch("src.handler.upload_json", return_value=True) as mock_upload,
    ):
        result = ingest_lol_champions_data("my-bucket")
    assert result == {"champions_uploaded": True}
    assert mock_upload.call_count == 1


def test_fetch_and_upload_lol_match_success():
    fake_match_details = {"metadata": {"matchId": "KR_123"}}
    timestamp = datetime(2026, 8, 13, 15, 30, 45, tzinfo=timezone.utc)

    with (
        patch(
            "src.handler.get_lol_match_details", return_value=fake_match_details
        ) as mock_get,
        patch("src.handler.upload_json", return_value=True) as mock_upload,
    ):
        result = _fetch_and_upload_lol_match("my-bucket", "asia", "KR_123", timestamp)

    mock_get.assert_called_once_with("asia", "KR_123")
    mock_upload.assert_called_once_with(
        "my-bucket",
        "league_of_legends/matches/year=2026/month=08/day=13/matches_KR_123_20260813T153045.json",
        fake_match_details,
    )
    assert result is True


def test_fetch_and_upload_lol_match_fetch_failure_returns_false():
    with (
        patch("src.handler.get_lol_match_details", return_value=None),
        patch("src.handler.upload_json") as mock_upload,
    ):
        result = _fetch_and_upload_lol_match(
            "my-bucket", "asia", "KR_123", datetime.now(timezone.utc)
        )

    mock_upload.assert_not_called()
    assert result is False


def test_fetch_and_upload_lol_match_upload_failure_returns_false():
    with (
        patch("src.handler.get_lol_match_details", return_value={"metadata": {}}),
        patch("src.handler.upload_json", return_value=False),
    ):
        result = _fetch_and_upload_lol_match(
            "my-bucket", "asia", "KR_123", datetime.now(timezone.utc)
        )

    assert result is False


def test_ingest_dota_data_success():
    fake_pro_matches = [{"match_id": 1}, {"match_id": 2}]
    with (
        patch("src.handler.get_pro_matches", return_value=fake_pro_matches),
        patch("src.handler.get_dota2_match_details", return_value={"match_id": 1}),
        patch("src.handler.upload_json", return_value=True) as mock_upload,
    ):
        result = ingest_dota_data("my-bucket")

    assert result == {"fetched": 2, "uploaded": 2, "failed": 0}
    assert mock_upload.call_count == 2


def test_ingest_dota_data_fetch_failure_returns_zeroed_results():
    with patch("src.handler.get_pro_matches", return_value=None):
        result = ingest_dota_data("my-bucket")

    assert result == {"fetched": 0, "uploaded": 0, "failed": 0}


def test_ingest_dota_data_mixed_results():
    fake_pro_matches = [{"match_id": 1}, {"match_id": 2}, {"match_id": 3}]
    with (
        patch("src.handler.get_pro_matches", return_value=fake_pro_matches),
        patch(
            "src.handler.get_dota2_match_details",
            side_effect=[{"match_id": 1}, None, {"match_id": 3}],
        ),
        patch("src.handler.upload_json", side_effect=[True, False]) as mock_upload,
    ):
        result = ingest_dota_data("my-bucket")

    assert result == {"fetched": 3, "uploaded": 1, "failed": 2}
    assert mock_upload.call_count == 2


def test_ingest_league_of_legends_data_success():
    fake_challenger = {"entries": [{"puuid": "p1"}, {"puuid": "p2"}]}
    with (
        patch("src.handler.get_challenger_leagues", return_value=fake_challenger),
        patch("src.handler.get_personal_match_list", return_value=["m1", "m2"]),
        patch("src.handler._fetch_and_upload_lol_match", return_value=True) as mock_fu,
    ):
        result = ingest_league_of_legends_data("my-bucket")

    assert result == {
        "players_processed": 2,
        "matches_uploaded": 4,
        "matches_failed": 0,
    }
    assert mock_fu.call_count == 4


def test_ingest_league_of_legends_data_challenger_fetch_failure():
    with patch("src.handler.get_challenger_leagues", return_value=None):
        result = ingest_league_of_legends_data("my-bucket")

    assert result == {
        "players_processed": 0,
        "matches_uploaded": 0,
        "matches_failed": 0,
    }


def test_ingest_league_of_legends_data_entry_missing_puuid_is_skipped():
    fake_challenger = {"entries": [{"no_puuid_here": True}]}
    with (
        patch("src.handler.get_challenger_leagues", return_value=fake_challenger),
        patch("src.handler.get_personal_match_list") as mock_get_matches,
    ):
        result = ingest_league_of_legends_data("my-bucket")

    mock_get_matches.assert_not_called()
    assert result == {
        "players_processed": 1,
        "matches_uploaded": 0,
        "matches_failed": 0,
    }


def test_lambda_handler_all_succeed():
    with (
        patch("src.handler.ingest_dota_data", return_value={"fetched": 1}),
        patch(
            "src.handler.ingest_dota_hero_data", return_value={"heroes_uploaded": True}
        ),
        patch(
            "src.handler.ingest_league_of_legends_data",
            return_value={"players_processed": 1},
        ),
        patch(
            "src.handler.ingest_lol_champions_data",
            return_value={"champions_uploaded": True},
        ),
    ):
        result = lambda_handler({}, None)

    assert result == {
        "dota2": {"fetched": 1},
        "dota_heroes": {"heroes_uploaded": True},
        "league_of_legends": {"players_processed": 1},
        "lol_champions": {"champions_uploaded": True},
    }


def test_lambda_handler_isolates_one_source_failure():
    with (
        patch("src.handler.ingest_dota_data", side_effect=RuntimeError("boom")),
        patch(
            "src.handler.ingest_dota_hero_data", return_value={"heroes_uploaded": True}
        ),
        patch(
            "src.handler.ingest_league_of_legends_data",
            return_value={"players_processed": 1},
        ),
        patch(
            "src.handler.ingest_lol_champions_data",
            return_value={"champions_uploaded": True},
        ) as mock_champs,
    ):
        result = lambda_handler({}, None)

    assert result["dota2"] == "failed"
    assert result["dota_heroes"] == {"heroes_uploaded": True}
    assert result["league_of_legends"] == {"players_processed": 1}
    assert result["lol_champions"] == {"champions_uploaded": True}
    mock_champs.assert_called_once()
