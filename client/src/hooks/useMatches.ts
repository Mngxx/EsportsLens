import {
    getDota2Match,
    getDota2PlayerMatches,
    getLoLMatch,
    getLoLPlayerMatches,
    getRecentDota2Matches,
    getRecentLoLMatches,
} from "../lib/api";
import { useApi } from "./useApi";
import type {
    Dota2Match,
    Dota2MatchSummary,
    Game,
    LoLMatch,
    LoLMatchSummary,
} from "../types";

export function usePlayerMatches(
    game: Game,
    id: string | number,
    limit?: number,
    enabled: boolean = true,
) {
    return useApi<Dota2Match[] | LoLMatch[]>(
        () =>
            game === "dota2"
                ? getDota2PlayerMatches(id as number, limit)
                : getLoLPlayerMatches(id as string, limit),
        [game, id, limit],
        enabled,
    );
}

export function useMatch(
    game: Game,
    matchId: string | number,
    enabled: boolean = true,
) {
    return useApi<Dota2Match[] | LoLMatch[]>(
        () =>
            game === "dota2"
                ? getDota2Match(matchId as number)
                : getLoLMatch(matchId as string),
        [game, matchId],
        enabled,
    );
}

export function useRecentMatches(game: Game, limit?: number) {
    return useApi<Dota2MatchSummary[] | LoLMatchSummary[]>(
        () =>
            game === "dota2"
                ? getRecentDota2Matches(limit)
                : getRecentLoLMatches(limit),
        [game, limit],
    );
}
