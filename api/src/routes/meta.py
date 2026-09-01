from src.models.schemas import (
    Dota2HeroSchema,
    Dota2HeroStatsSchema,
    LoLChampionSchema,
    LoLChampionStatsSchema,
)
from fastapi import APIRouter
from src.db.athena import run_query

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/dota2/heroes", response_model=list[Dota2HeroSchema])
async def get_dota2_heroes() -> list[Dota2HeroSchema]:
    sql = "SELECT * FROM dota2_heroes ORDER BY name ASC"
    dota2_heroes = await run_query(sql)
    return dota2_heroes


@router.get("/dota2/heroes/stats", response_model=list[Dota2HeroStatsSchema])
async def get_dota2_heroes_stats() -> list[Dota2HeroStatsSchema]:
    sql = "SELECT * FROM dota2_hero_stats ORDER BY hero_name ASC"
    dota2_heroes_stats = await run_query(sql)
    return dota2_heroes_stats


@router.get("/lol/champions", response_model=list[LoLChampionSchema])
async def get_lol_champions() -> list[LoLChampionSchema]:
    sql = "SELECT * FROM league_of_legends_champions ORDER BY name ASC"
    lol_champions = await run_query(sql)
    return lol_champions


@router.get("/lol/champions/stats", response_model=list[LoLChampionStatsSchema])
async def get_lol_champions_stats() -> list[LoLChampionStatsSchema]:
    sql = "SELECT * FROM league_of_legends_champion_stats ORDER BY champion_name ASC"
    lol_champions_stats = await run_query(sql)
    return lol_champions_stats
