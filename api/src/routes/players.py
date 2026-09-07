from models.schemas import (
    Dota2MatchSchema,
    LoLMatchSchema,
    Dota2PlayerSearchSchema,
    LoLPlayerSearchSchema,
)
from db.athena import run_query
from fastapi import APIRouter, Query, Path

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/dota2/{account_id}/matches", response_model=list[Dota2MatchSchema])
def get_dota2_players(
    account_id: int, limit: int = Query(default=10, le=50)
) -> list[Dota2MatchSchema]:
    sql = f"SELECT * FROM dota2_matches WHERE account_id = {account_id} ORDER BY match_date DESC LIMIT {limit}"
    dota2_players = run_query(sql)
    return dota2_players


@router.get("/lol/{puuid}/matches", response_model=list[LoLMatchSchema])
def get_lol_players(
    puuid: str = Path(pattern=r"^[A-Za-z0-9_-]+$"),
    limit: int = Query(default=10, le=50),
) -> list[LoLMatchSchema]:
    sql = f"SELECT * FROM league_of_legends_matches WHERE puuid = '{puuid}' ORDER BY match_date DESC LIMIT {limit}"
    lol_players = run_query(sql)
    return lol_players


@router.get("/dota2/search", response_model=list[Dota2PlayerSearchSchema])
def search_dota2_players(
    name: str = Query(min_length=3, max_length=50),
    limit: int = Query(default=10, le=50),
) -> list[Dota2PlayerSearchSchema]:
    safe_name = name.replace("'", "''")
    sql = f"SELECT DISTINCT account_id, player_name FROM dota2_matches WHERE LOWER(player_name) LIKE LOWER('%{safe_name}%') ORDER BY player_name DESC LIMIT {limit}"
    dota2_players = run_query(sql)
    return dota2_players


@router.get("/lol/search", response_model=list[LoLPlayerSearchSchema])
def search_lol_players(
    name: str = Query(min_length=3, max_length=50),
    limit: int = Query(default=10, le=50),
) -> list[LoLPlayerSearchSchema]:
    safe_name = name.replace("'", "''")
    sql = f"SELECT DISTINCT puuid, player_name FROM league_of_legends_matches WHERE LOWER(player_name) LIKE LOWER('%{safe_name}%') ORDER BY player_name DESC LIMIT {limit}"
    lol_players = run_query(sql)
    return lol_players
