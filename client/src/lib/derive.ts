import type {
    Dota2HeroStats,
    Dota2Match,
    Game,
    HeroChampionStat,
    LoLChampionStats,
    LoLMatch,
    MatchRow,
    PlayerStats,
} from "../types";

/**
 * Turns one raw match row into MatchTable's normalized MatchRow shape.
 *
 * Dota2Match only carries `hero_id`, not a hero name — the name lives in
 * Dota2Hero[] (from useMetaHeroes(game).data), so the Dota2 branch needs a
 * lookup passed in. LoLMatch already carries `champion_name` directly, no
 * lookup needed there.
 */
export function toMatchRow(
    match: Dota2Match | LoLMatch,
    game: Game,
    dota2HeroLookup?: Record<number, string>,
): MatchRow {
    if (game === "dota2") {
        const m = match as Dota2Match;
        return {
            matchId: m.match_id,
            game,
            characterName: dota2HeroLookup?.[m.hero_id] ?? "Unknown",
            win: m.win,
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists,
            matchDate: m.match_date,
        };
    }

    const m = match as LoLMatch;
    return {
        matchId: m.match_id,
        game,
        characterName: m.champion_name,
        win: m.win,
        kills: m.kills,
        deaths: m.deaths,
        assists: m.assists,
        matchDate: m.match_date,
    };
}

/**
 * Reduces a fetched match list into PlayerCard's summary stats. Note this is
 * "stats over the fetched page" (bounded by whatever `limit` the caller
 * passed to usePlayerMatches), not true all-time stats.
 *
 * Dota2Match already has a precomputed `kda` field per match (from the ETL
 * layer) — LoLMatch doesn't, so the two games' avgKda math isn't symmetric.
 * Don't try to force one formula for both branches.
 */
export function derivePlayerStats(
    matches: (Dota2Match | LoLMatch)[],
    game: Game,
): PlayerStats {
    if (matches.length === 0) {
        return { winRate: 0, avgKda: 0, matchesPlayed: 0 };
    }

    const wins = matches.filter((m) => m.win).length;
    const winRate = wins / matches.length;

    let avgKda = 0;
    if (game === "dota2") {
        const dota2Matches = matches as Dota2Match[];
        const kda = dota2Matches.reduce((acc, m) => acc + m.kda, 0);
        avgKda = kda / matches.length;
    } else {
        const kda = matches.reduce(
            (acc, m) => acc + (m.kills + m.assists) / Math.max(m.deaths, 1),
            0,
        );
        avgKda = kda / matches.length;
    }

    return {
        winRate,
        avgKda,
        matchesPlayed: matches.length,
    };
}

/**
 * Normalizes one hero/champion stats row for PickWinScatter/HeroChampionGrid,
 * so those components never have to branch on `game` themselves.
 */
export function toHeroChampionStat(
    stat: Dota2HeroStats | LoLChampionStats,
    game: Game,
): HeroChampionStat {
    if (game === "dota2") {
        const s = stat as Dota2HeroStats;
        return {
            id: s.hero_id,
            name: s.hero_name,
            pickRate: s.pick_rate,
            winRate: s.win_rate,
        };
    }

    const s = stat as LoLChampionStats;
    return {
        id: s.champion_id,
        name: s.champion_name,
        pickRate: s.pick_rate,
        winRate: s.win_rate,
    };
}
