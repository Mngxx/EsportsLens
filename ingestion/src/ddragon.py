from api import LOL_DDRAGON_API_URL
from http_client import safe_get


def get_current_version() -> str | None:
    current_version = safe_get(f"{LOL_DDRAGON_API_URL}/api/versions.json")
    return current_version[0] if current_version else None


def get_champion_data(version: str) -> dict | None:
    champion_data = safe_get(
        f"{LOL_DDRAGON_API_URL}/cdn/{version}/data/en_US/champion.json"
    )
    return champion_data
