import os

import boto3
from dotenv import load_dotenv
from http_client import safe_get

load_dotenv()


def _get_riot_api_key() -> str | None:
    env_key = os.getenv("RIOT_API_KEY")
    if env_key:
        return env_key

    # Falls back to SSM in the deployed Lambda (ingestion-stack.ts).
    param_name = os.getenv("RIOT_API_KEY_PARAM_NAME")
    if not param_name:
        return None
    ssm = boto3.client("ssm")
    return ssm.get_parameter(Name=param_name, WithDecryption=True)["Parameter"]["Value"]


API_KEY = _get_riot_api_key()
HEADERS = {"X-Riot-Token": API_KEY}


def build_api_url(region: str) -> str:
    return f"https://{region}.api.riotgames.com/"


def get_puuid(region: str, game_name: str, tag_line: str) -> str | None:
    personal_data = safe_get(
        f"{build_api_url(region)}riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}",
        headers=HEADERS,
    )
    return personal_data["puuid"] if personal_data else None


def get_match_details(region: str, match_id: str) -> dict | None:
    match_details = safe_get(
        f"{build_api_url(region)}lol/match/v5/matches/{match_id}",
        headers=HEADERS,
    )
    return match_details


def get_personal_match_list(region: str, puuid: str) -> list[str] | None:
    personal_match_list = safe_get(
        f"{build_api_url(region)}lol/match/v5/matches/by-puuid/{puuid}/ids",
        headers=HEADERS,
    )
    return personal_match_list


def get_challenger_leagues(region: str, queue: str) -> dict | None:
    challenger_leagues = safe_get(
        f"{build_api_url(region)}lol/league/v4/challengerleagues/by-queue/{queue}",
        headers=HEADERS,
    )
    return challenger_leagues


def get_rank_by_puuid(region: str, puuid: str) -> list[dict] | None:
    rank_by_puuid = safe_get(
        f"{build_api_url(region)}lol/league/v4/entries/by-puuid/{puuid}",
        headers=HEADERS,
    )
    return rank_by_puuid
