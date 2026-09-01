from src.models.schemas import Dota2MatchSchema, LoLMatchSchema
from fastapi import APIRouter
from src.db.athena import run_query

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/dota2/{match_id}", response_model=list[Dota2MatchSchema])
async def get_dota2_matches(match_id: int) -> list[Dota2MatchSchema]:
    sql = f"SELECT * FROM dota2_matches WHERE match_id = {match_id}"
    dota2_matches = await run_query(sql)
    return dota2_matches


@router.get("/lol/{match_id}", response_model=list[LoLMatchSchema])
async def get_lol_matches(match_id: int) -> list[LoLMatchSchema]:
    sql = f"SELECT * FROM league_of_legends_matches WHERE match_id = {match_id}"
    lol_matches = await run_query(sql)
    return lol_matches
