from api import DOTA_API_URL
from http_client import safe_get


def get_heroes() -> list[dict] | None:
    heroes = safe_get(f"{DOTA_API_URL}/heroes")
    return heroes


def get_hero_stats() -> list[dict] | None:
    hero_stats = safe_get(f"{DOTA_API_URL}/heroStats")
    return hero_stats


def get_heroes_matchups(hero_id: int) -> list[dict] | None:
    heroes_matchups = safe_get(f"{DOTA_API_URL}/heroes/{hero_id}/matchups")
    return heroes_matchups


def get_match_details(match_id: int) -> dict | None:
    match_details = safe_get(f"{DOTA_API_URL}/matches/{match_id}")
    return match_details


def get_player_recent_matches(account_id: int) -> list[dict] | None:
    player_recent_matches = safe_get(
        f"{DOTA_API_URL}/players/{account_id}/recentMatches"
    )
    return player_recent_matches


def get_player_data(account_id: int) -> dict | None:
    player_data = safe_get(f"{DOTA_API_URL}/players/{account_id}")
    return player_data


def get_pro_players() -> list[dict] | None:
    pro_players = safe_get(f"{DOTA_API_URL}/proPlayers")
    return pro_players


def get_top_players() -> list[dict] | None:
    top_players = safe_get(f"{DOTA_API_URL}/topPlayers")
    return top_players


def get_pro_matches(less_than_match_id: int | None = None) -> list[dict] | None:
    params = (
        {} if less_than_match_id is None else {"less_than_match_id": less_than_match_id}
    )
    pro_matches = safe_get(
        f"{DOTA_API_URL}/proMatches/",
        params=params,
    )
    return pro_matches
