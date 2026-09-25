import pytest
from cache import clear_all


@pytest.fixture(autouse=True)
def _clear_route_caches():
    """Routes are wrapped in @ttl_cache — without this, one test's mocked
    run_query result would leak into a later test hitting the same route
    with the same params but a different mock."""
    clear_all()
    yield


def make_dota2_match_row(**overrides):
    row = {
        "match_id": "123",
        "account_id": 3456,
        "player_name": "test_player_1",
        "hero_id": 6,
        "team": "radiant",
        "win": True,
        "kills": 10,
        "deaths": 2,
        "assists": 5,
        "kda": 7.5,
        "last_hits": 200,
        "denies": 10,
        "gold_per_min": 600,
        "xp_per_min": 700,
        "net_worth": 20000,
        "hero_damage": 15000,
        "tower_damage": 3000,
        "hero_healing": 0,
        "level": 25,
        "league_id": 1,
        "duration_secs": 2400,
        "match_date": "2026-08-01T12:00:00",
        "year": 2026,
        "month": 8,
    }
    row.update(overrides)
    return row


def make_dota2_heroes_row(**overrides):
    row = {
        "hero_id": 6,
        "name": "npc_dota_hero_antimage",
        "localized_name": "Anti-Mage",
        "primary_attr": "agi",
        "attack_type": "Meele",
    }
    row.update(overrides)
    return row


def make_dota2_hero_stats_row(**overrides):
    row = {
        "hero_id": 6,
        "hero_name": "npc_dota_hero_antimage",
        "primary_attr": "agi",
        "attack_type": "Meele",
        "pub_pick": 35467,
        "pub_win": 23356,
        "pro_pick": 0,
        "pro_win": 0,
        "pro_ban": 0,
        "win_rate": 0.75,
        "ban_rate": 0.05,
        "pick_rate": 0.11,
    }
    row.update(overrides)
    return row


def make_lol_match_row(**overrides):
    row = {
        "match_id": "abc123",
        "puuid": "puuid-xyz-789",
        "player_name": "test_player_1#NA1",
        "champion_id": 157,
        "champion_name": "Yasuo",
        "team_id": 100,
        "win": True,
        "kills": 12,
        "deaths": 3,
        "assists": 8,
        "gold_earned": 14000,
        "damage_to_champions": 22000,
        "cs": 180,
        "vision_score": 25,
        "champ_level": 18,
        "queue_id": 420,
        "duration_secs": 1800,
        "match_date": "2026-08-01T12:00:00",
        "year": 2026,
        "month": 8,
    }
    row.update(overrides)
    return row


def make_lol_champions_row(**overrides):
    row = {
        "champion_id": 157,
        "name": "Yasuo",
        "title": "The Unforgiven",
        "primary_tag": "Fighter",
        "attack": 8,
        "defense": 6,
        "magic": 3,
        "difficulty": 4,
    }
    row.update(overrides)
    return row


def make_lol_champion_stats_row(**overrides):
    row = {
        "champion_id": 157,
        "champion_name": "Yasuo",
        "matches_played": 12,
        "wins": 12,
        "pick_rate": 0.12,
        "win_rate": 1.0,
    }
    row.update(overrides)
    return row


def make_dota2_player_search_row(**overrides):
    row = {
        "account_id": 3456,
        "player_name": "test_player_1",
    }
    row.update(overrides)
    return row


def make_lol_player_search_row(**overrides):
    row = {
        "puuid": "puuid-xyz-789",
        "player_name": "test_player_1#NA1",
    }
    row.update(overrides)
    return row


def make_dota2_match_summary_row(**overrides):
    row = {
        "match_id": "123",
        "match_date": "2026-08-01T12:00:00",
        "duration_secs": 2400,
        "winning_team": "radiant",
    }
    row.update(overrides)
    return row


def make_lol_match_summary_row(**overrides):
    row = {
        "match_id": "abc123",
        "match_date": "2026-08-01T12:00:00",
        "duration_secs": 1800,
        "winning_team_id": 100,
    }
    row.update(overrides)
    return row


def make_dota2_top_player_row(**overrides):
    row = {
        "account_id": 3456,
        "player_name": "test_player_1",
        "avg_kda": 4.5,
    }
    row.update(overrides)
    return row


def make_lol_top_player_row(**overrides):
    row = {
        "puuid": "puuid-xyz-789",
        "player_name": "test_player_1#NA1",
        "avg_kda": 3.2,
    }
    row.update(overrides)
    return row


def make_dota2_most_picked_row(**overrides):
    row = {
        "hero_id": 6,
        "pick_count": 15,
    }
    row.update(overrides)
    return row


def make_lol_most_picked_row(**overrides):
    row = {
        "champion_id": 157,
        "champion_name": "Yasuo",
        "pick_count": 20,
    }
    row.update(overrides)
    return row
