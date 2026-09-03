from src.models.schemas import Dota2MatchSchema, LoLMatchSchema
from fastapi import APIRouter, Path
from src.db.athena import run_query

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/dota2/{match_id}", response_model=list[Dota2MatchSchema])
def get_dota2_matches(match_id: int) -> list[Dota2MatchSchema]:
    sql = f"SELECT * FROM dota2_matches WHERE match_id = {match_id}"
    dota2_matches = run_query(sql)
    return dota2_matches


@router.get("/lol/{match_id}", response_model=list[LoLMatchSchema])
def get_lol_matches(
    match_id: str = Path(pattern=r"^[A-Za-z0-9_-]+$"),
) -> list[LoLMatchSchema]:
    sql = f"SELECT * FROM league_of_legends_matches WHERE match_id = '{match_id}'"
    lol_matches = run_query(sql)
    return lol_matches
