import logging
import os
from datetime import datetime, timezone

from ddragon import get_champion_data, get_current_version
from dota import (
    get_hero_stats,
    get_heroes,
    get_pro_matches,
)
from dota import (
    get_match_details as get_dota2_match_details,
)
from dotenv import load_dotenv
from league_of_legends import (
    get_challenger_leagues,
    get_personal_match_list,
)
from league_of_legends import (
    get_match_details as get_lol_match_details,
)
from s3_writer import upload_json

load_dotenv()

logging.basicConfig(
    level=logging.WARNING, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
PLATFORM = "kr"
CONTINENTAL_REGION = "asia"


def build_object_key(
    game: str, entity: str, identifier: str, timestamp: datetime
) -> str:
    year = timestamp.strftime("%Y")
    month = timestamp.strftime("%m")
    day = timestamp.strftime("%d")
    timestamp_str = timestamp.strftime("%Y%m%dT%H%M%S")
    return f"{game}/{entity}/year={year}/month={month}/day={day}/{entity}_{identifier}_{timestamp_str}.json"


def ingest_dota_data(bucket: str) -> dict:
    timestamp = datetime.now(timezone.utc)
    pro_matches = get_pro_matches()
    results = {
        "fetched": 0,
        "uploaded": 0,
        "failed": 0,
    }
    if pro_matches is None:
        logger.warning(
            "Failed to fetch Dota 2 pro matches from OpenDota — skipping this ingestion cycle."
        )
        return results
    pro_matches = pro_matches[:10]
    results["fetched"] = len(pro_matches)
    for match in pro_matches:
        match_id = match["match_id"]
        match_details = get_dota2_match_details(match_id)
        if match_details is None:
            logger.warning(
                f"Failed to fetch match details using the match id: {match_id}"
            )
            results["failed"] += 1
            continue
        s3_object_key = build_object_key("dota2", "matches", str(match_id), timestamp)
        if upload_json(bucket, s3_object_key, match_details):
            results["uploaded"] += 1
        else:
            results["failed"] += 1
    return results


def ingest_dota_hero_data(bucket: str) -> dict:
    timestamp = datetime.now(timezone.utc)
    heroes = get_heroes()
    results = {"heroes_uploaded": False, "hero_stats_uploaded": False}
    if heroes is None:
        logger.warning("Failed to fetch Dota 2 hero list from OpenDota.")
    else:
        s3_object_key = build_object_key("dota2", "heroes", "all", timestamp)
        if upload_json(bucket, s3_object_key, heroes):
            results["heroes_uploaded"] = True
    hero_stats = get_hero_stats()
    if hero_stats is None:
        logger.warning("Failed to fetch Dota 2 hero stats from OpenDota.")
    else:
        s3_object_key = build_object_key("dota2", "hero_stats", "all", timestamp)
        if upload_json(bucket, s3_object_key, hero_stats):
            results["hero_stats_uploaded"] = True
    return results


def ingest_league_of_legends_data(bucket: str) -> dict:
    timestamp = datetime.now(timezone.utc)
    challenger_leagues = get_challenger_leagues(PLATFORM, "RANKED_SOLO_5x5")
    results = {"players_processed": 0, "matches_uploaded": 0, "matches_failed": 0}
    if challenger_leagues is None:
        logger.warning(
            "Failed to fetch League of Legends Challenger league (KR, RANKED_SOLO_5x5) from Riot API."
        )
        return results

    entries = challenger_leagues.get("entries", [])[:10]
    results["players_processed"] = len(entries)
    for entry in entries:
        puuid = entry.get("puuid")
        if puuid is None:
            logger.warning(f"Entry missing puuid, skipping: {entry}")
            continue
        match_ids = get_personal_match_list(CONTINENTAL_REGION, puuid)
        if match_ids is None:
            logger.warning(
                f"Failed to fetch match list for puuid {puuid} from Riot API."
            )
            continue
        match_ids = match_ids[:3]
        for match_id in match_ids:
            if _fetch_and_upload_lol_match(
                bucket, CONTINENTAL_REGION, match_id, timestamp
            ):
                results["matches_uploaded"] += 1
            else:
                results["matches_failed"] += 1

    return results


def _fetch_and_upload_lol_match(
    bucket: str, region: str, match_id: str, timestamp: datetime
) -> bool:
    match_details = get_lol_match_details(region, match_id)
    if match_details is None:
        logger.warning(
            f"Failed to fetch League of Legends match details for match_id {match_id}."
        )
        return False
    key = build_object_key("league_of_legends", "matches", match_id, timestamp)
    return upload_json(bucket, key, match_details)


def ingest_lol_champions_data(bucket: str) -> dict:
    timestamp = datetime.now(timezone.utc)
    current_version = get_current_version()
    results = {"champions_uploaded": False}
    if current_version is None:
        logger.warning(
            "Failed to fetch current League of Legends patch version from Data Dragon."
        )
        return results
    champion_data = get_champion_data(current_version)
    if champion_data is None:
        logger.warning(
            f"Failed to fetch champion data for League of Legends version {current_version} from Data Dragon."
        )
    else:
        s3_object_key = build_object_key(
            "league_of_legends", "champions", "all", timestamp
        )
        if upload_json(bucket, s3_object_key, champion_data):
            results["champions_uploaded"] = True
    return results


def lambda_handler(event, context) -> dict:
    bucket = os.getenv("RAW_BUCKET_NAME")
    results = {}
    for name, ingest_fn in [
        ("dota2", ingest_dota_data),
        ("dota_heroes", ingest_dota_hero_data),
        ("league_of_legends", ingest_league_of_legends_data),
        ("lol_champions", ingest_lol_champions_data),
    ]:
        try:
            results[name] = ingest_fn(bucket)
        except Exception as exc:
            logger.error(f"{name} ingestion failed: {exc}")
            results[name] = "failed"

    logger.info(f"Ingestion run complete: {results}")

    return results
