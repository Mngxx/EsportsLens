from src.models.schemas import Dota2MatchSchema, LoLMatchSchema
from src.db.athena import run_query
from fastapi import APIRouter, Query
from pydantic Field

router = APIRouter(prefix="/players", tags=["players"])


@router.get(
    "/dota2/{account_id}/matches?limit=10", response_model=list[Dota2MatchSchema]
)
async def get_dota2_players(
    account_id: int, limit: int = Query(default=10, le=50)
) -> list[Dota2MatchSchema]:
    sql = f"SELECT * FROM dota2_matches WHERE account_id = {account_id} ORDER BY match_date DESC LIMIT {limit}"
    dota2_players = run_query(sql)
    return dota2_players


@router.get("/lol/{puuid}/matches?limit=10", response_model=list[LoLMatchSchema])
async def get_lol_players(
    puuid: str = Field(pattern=r"^[A-Za-z0-9_-]+$"), limit: int = Query(default=10, le=50)
) -> list[LoLMatchSchema]:
    sql = f"SELECT * FROM lol_matches WHERE puuid = '{puuid}' ORDER BY match_date DESC LIMIT {limit}"
    lol_players = run_query(sql)
    return lol_players
