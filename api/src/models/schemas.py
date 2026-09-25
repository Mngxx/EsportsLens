from pydantic import BaseModel, field_validator
from datetime import datetime


class HealthSchema(BaseModel):
    status: str
    last_run: str | None


class Dota2MatchSchema(BaseModel):
    match_id: str
    account_id: int
    player_name: str
    hero_id: int
    team: str
    win: bool
    kills: int
    deaths: int
    assists: int
    kda: float
    last_hits: int
    denies: int
    gold_per_min: int
    xp_per_min: int
    net_worth: int
    hero_damage: int
    tower_damage: int
    hero_healing: int
    level: int
    league_id: int
    duration_secs: int
    match_date: datetime
    year: int
    month: int


class Dota2HeroSchema(BaseModel):
    hero_id: int
    name: str
    localized_name: str
    primary_attr: str
    attack_type: str


class Dota2HeroStatsSchema(BaseModel):
    hero_id: int
    hero_name: str
    primary_attr: str
    attack_type: str
    pub_pick: int
    pub_win: int
    pro_pick: int
    pro_win: int
    pro_ban: int
    win_rate: float | None
    ban_rate: float | None
    pick_rate: float

    @field_validator("win_rate", "ban_rate", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        return None if v == "" else v


class LoLMatchSchema(BaseModel):
    match_id: str
    puuid: str
    player_name: str
    champion_id: int
    champion_name: str
    team_id: int
    win: bool
    kills: int
    deaths: int
    assists: int
    gold_earned: int
    damage_to_champions: int
    cs: int
    vision_score: int
    champ_level: int
    queue_id: int
    duration_secs: int
    match_date: datetime
    year: int
    month: int


class LoLChampionSchema(BaseModel):
    champion_id: int
    name: str
    title: str
    primary_tag: str
    attack: int
    defense: int
    magic: int
    difficulty: int


class LoLChampionStatsSchema(BaseModel):
    champion_id: int
    champion_name: str
    matches_played: int
    wins: int
    pick_rate: float
    win_rate: float


class Dota2PlayerSearchSchema(BaseModel):
    account_id: int
    player_name: str


class LoLPlayerSearchSchema(BaseModel):
    puuid: str
    player_name: str


class Dota2MatchSummarySchema(BaseModel):
    match_id: str
    match_date: datetime
    duration_secs: int
    winning_team: str


class LoLMatchSummarySchema(BaseModel):
    match_id: str
    match_date: datetime
    duration_secs: int
    winning_team_id: int


class Dota2TopPlayerSchema(BaseModel):
    account_id: int
    player_name: str
    avg_kda: float


class Dota2MostPickedSchema(BaseModel):
    hero_id: int
    pick_count: int


class Dota2DashboardSummarySchema(BaseModel):
    matches_today: int
    top_players_by_kda: list[Dota2TopPlayerSchema]
    most_picked_hero: Dota2MostPickedSchema | None


class LoLTopPlayerSchema(BaseModel):
    puuid: str
    player_name: str
    avg_kda: float


class LoLMostPickedSchema(BaseModel):
    champion_id: int
    champion_name: str
    pick_count: int


class LoLDashboardSummarySchema(BaseModel):
    matches_today: int
    top_players_by_kda: list[LoLTopPlayerSchema]
    most_picked_champion: LoLMostPickedSchema | None
