export interface Dota2Match {
    match_id: string;
    account_id: number;
    player_name: string;
    hero_id: number;
    team: "radiant" | "dire";
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    last_hits: number;
    denies: number;
    gold_per_min: number;
    xp_per_min: number;
    net_worth: number;
    hero_damage: number;
    tower_damage: number;
    hero_healing: number;
    level: number;
    league_id: number;
    duration_secs: number;
    match_date: string; // ISO 8601 — API returns Pydantic's datetime as a JSON string
    year: number;
    month: number;
}

export interface Dota2Hero {
    hero_id: number;
    name: string;
    localized_name: string;
    primary_attr: string;
    attack_type: string;
}

export interface Dota2HeroStats {
    hero_id: number;
    hero_name: string;
    primary_attr: string;
    attack_type: string;
    pub_pick: number;
    pub_win: number;
    pro_pick: number;
    pro_win: number;
    pro_ban: number;
    win_rate: number | null; // null when a hero has zero pro picks/bans (see schemas.py validator)
    ban_rate: number | null;
    pick_rate: number;
}

export interface Dota2PlayerSearchResult {
    account_id: number;
    player_name: string;
}

export interface LoLMatch {
    match_id: string;
    puuid: string;
    player_name: string;
    champion_id: number;
    champion_name: string;
    team_id: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    gold_earned: number;
    damage_to_champions: number;
    cs: number;
    vision_score: number;
    champ_level: number;
    queue_id: number;
    duration_secs: number;
    match_date: string;
    year: number;
    month: number;
}

export interface LoLChampion {
    champion_id: number;
    name: string;
    title: string;
    primary_tag: string;
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
}

export interface LoLChampionStats {
    champion_id: number;
    champion_name: string;
    matches_played: number;
    wins: number;
    pick_rate: number;
    win_rate: number;
}

export interface LoLPlayerSearchResult {
    puuid: string;
    player_name: string;
}

export interface ApiErrorResponse {
    detail?: unknown;
    details?: string;
}

export type Game = "dota2" | "lol";

export interface PlayerStats {
    winRate: number; // 0-1
    avgKda: number;
    matchesPlayed: number;
}

export interface MatchRow {
    matchId: string;
    game: Game;
    characterName: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    matchDate: string; // ISO 8601
}
