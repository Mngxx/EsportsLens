import {
    getDota2Heroes,
    getDota2HeroStats,
    getLoLChampions,
    getLoLChampionStats,
} from "../lib/api";
import { useApi } from "./useApi";
import type { Game } from "../types";

export function useMetaHeroes(game: Game) {
    return useApi(
        () => (game === "dota2" ? getDota2Heroes() : getLoLChampions()),
        [game],
    );
}

export function useMetaHeroStats(game: Game) {
    return useApi(
        () => (game === "dota2" ? getDota2HeroStats() : getLoLChampionStats()),
        [game],
    );
}
