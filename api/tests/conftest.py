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
