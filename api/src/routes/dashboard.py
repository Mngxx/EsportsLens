from models.schemas import Dota2DashboardSummarySchema, LoLDashboardSummarySchema
from cache import ttl_cache
from fastapi import APIRouter
from db.athena import run_query

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/dota2/summary", response_model=Dota2DashboardSummarySchema)
@ttl_cache(seconds=300)
def get_dota2_dashboard_summary() -> Dota2DashboardSummarySchema:
    matches_today = run_query(
        "SELECT COUNT(DISTINCT match_id) AS matches_today FROM dota2_matches WHERE date(match_date) = current_date"
    )
    top_players = run_query(
        "SELECT account_id, player_name, AVG(kda) AS avg_kda FROM dota2_matches "
        "WHERE match_date >= date_add('day', -7, current_date) "
        "GROUP BY account_id, player_name ORDER BY avg_kda DESC LIMIT 5"
    )
    most_picked = run_query(
        "SELECT hero_id, COUNT(*) AS pick_count FROM dota2_matches "
        "WHERE match_date >= date_add('day', -7, current_date) "
        "GROUP BY hero_id ORDER BY pick_count DESC LIMIT 1"
    )
    return Dota2DashboardSummarySchema(
        matches_today=matches_today[0]["matches_today"] if matches_today else 0,
        top_players_by_kda=top_players,
        most_picked_hero=most_picked[0] if most_picked else None,
    )


@router.get("/lol/summary", response_model=LoLDashboardSummarySchema)
@ttl_cache(seconds=300)
def get_lol_dashboard_summary() -> LoLDashboardSummarySchema:
    matches_today = run_query(
        "SELECT COUNT(DISTINCT match_id) AS matches_today FROM league_of_legends_matches WHERE date(match_date) = current_date"
    )
    top_players = run_query(
        "SELECT puuid, player_name, AVG((kills + assists) / GREATEST(deaths, 1)) AS avg_kda FROM league_of_legends_matches "
        "WHERE match_date >= date_add('day', -7, current_date) "
        "GROUP BY puuid, player_name ORDER BY avg_kda DESC LIMIT 5"
    )
    most_picked = run_query(
        "SELECT champion_id, champion_name, COUNT(*) AS pick_count FROM league_of_legends_matches "
        "WHERE match_date >= date_add('day', -7, current_date) "
        "GROUP BY champion_id, champion_name ORDER BY pick_count DESC LIMIT 1"
    )
    return LoLDashboardSummarySchema(
        matches_today=matches_today[0]["matches_today"] if matches_today else 0,
        top_players_by_kda=top_players,
        most_picked_champion=most_picked[0] if most_picked else None,
    )
