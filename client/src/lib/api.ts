import type {
    ApiErrorResponse,
    Dota2Hero,
    Dota2HeroStats,
    Dota2Match,
    Dota2MatchSummary,
    Dota2PlayerSearchResult,
    LoLChampion,
    LoLChampionStats,
    LoLMatch,
    LoLMatchSummary,
    LoLPlayerSearchResult,
} from "../types";
import { API_URL } from "../config";
import { ApiError, setLimit, checkName } from "./validation";

async function apiFetch<T>(
    path: string,
    params?: Record<string, string | number>,
): Promise<T> {
    const url = new URL(path, API_URL);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, String(value));
        }
    }

    const response = await fetch(url);

    if (!response.ok) {
        const body: ApiErrorResponse = await response.json().catch(() => ({}));
        const message =
            body.details ??
            (typeof body.detail === "string"
                ? body.detail
                : response.statusText);
        throw new ApiError(response.status, message);
    }

    return response.json() as Promise<T>;
}

export function getDota2PlayerMatches(
    account_id: number,
    limit?: number,
): Promise<Dota2Match[]> {
    const effectiveLimit = setLimit(limit);
    return apiFetch<Dota2Match[]>(`/players/dota2/${account_id}/matches`, {
        limit: effectiveLimit,
    });
}

export function getLoLPlayerMatches(
    puuid: string,
    limit?: number,
): Promise<LoLMatch[]> {
    const effectiveLimit = setLimit(limit);
    return apiFetch<LoLMatch[]>(`/players/lol/${puuid}/matches`, {
        limit: effectiveLimit,
    });
}

export function searchDota2Players(
    name: string,
    limit?: number,
): Promise<Dota2PlayerSearchResult[]> {
    const effectiveLimit = setLimit(limit);
    checkName(name);
    return apiFetch<Dota2PlayerSearchResult[]>("/players/dota2/search", {
        name,
        limit: effectiveLimit,
    });
}

export function searchLoLPlayers(
    name: string,
    limit?: number,
): Promise<LoLPlayerSearchResult[]> {
    const effectiveLimit = setLimit(limit);
    checkName(name);
    return apiFetch<LoLPlayerSearchResult[]>("/players/lol/search", {
        name,
        limit: effectiveLimit,
    });
}

export function getDota2Match(match_id: number): Promise<Dota2Match[]> {
    return apiFetch<Dota2Match[]>(`/matches/dota2/${match_id}`);
}

export function getLoLMatch(match_id: string): Promise<LoLMatch[]> {
    return apiFetch<LoLMatch[]>(`/matches/lol/${match_id}`);
}

export function getDota2Heroes(): Promise<Dota2Hero[]> {
    return apiFetch<Dota2Hero[]>("/meta/dota2/heroes");
}

export function getDota2HeroStats(): Promise<Dota2HeroStats[]> {
    return apiFetch<Dota2HeroStats[]>("/meta/dota2/heroes/stats");
}

export function getLoLChampions(): Promise<LoLChampion[]> {
    return apiFetch<LoLChampion[]>("/meta/lol/champions");
}

export function getLoLChampionStats(): Promise<LoLChampionStats[]> {
    return apiFetch<LoLChampionStats[]>("/meta/lol/champions/stats");
}

export function getRecentDota2Matches(
    limit?: number,
): Promise<Dota2MatchSummary[]> {
    const effectiveLimit = setLimit(limit);
    return apiFetch<Dota2MatchSummary[]>("/matches/dota2/recent", {
        limit: effectiveLimit,
    });
}

export function getRecentLoLMatches(
    limit?: number,
): Promise<LoLMatchSummary[]> {
    const effectiveLimit = setLimit(limit);
    return apiFetch<LoLMatchSummary[]>("/matches/lol/recent", {
        limit: effectiveLimit,
    });
}
