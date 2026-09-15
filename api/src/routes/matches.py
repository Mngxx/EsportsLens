from models.schemas import (
    Dota2MatchSchema,
    LoLMatchSchema,
    Dota2MatchSummarySchema,
    LoLMatchSummarySchema,
)
from fastapi import APIRouter, Path, Query
from db.athena import run_query

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/dota2/recent", response_model=list[Dota2MatchSummarySchema])
def get_recent_dota2_matches(
    limit: int = Query(default=10, le=50),
) -> list[Dota2MatchSummarySchema]:
    sql = f"SELECT DISTINCT match_id, match_date, duration_secs, team AS winning_team FROM dota2_matches WHERE win = true ORDER BY match_date DESC LIMIT {limit}"
    recent_dota2_matches = run_query(sql)
    return recent_dota2_matches


@router.get("/lol/recent", response_model=list[LoLMatchSummarySchema])
def get_recent_lol_matches(
    limit: int = Query(default=10, le=50),
) -> list[LoLMatchSummarySchema]:
    sql = f"SELECT DISTINCT match_id, match_date, duration_secs, team_id AS winning_team_id FROM league_of_legends_matches WHERE win = true ORDER BY match_date DESC LIMIT {limit}"
    recent_lol_matches = run_query(sql)
    return recent_lol_matches


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
