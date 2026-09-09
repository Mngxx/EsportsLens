import {
    getDota2Heroes,
    getDota2HeroStats,
    getLoLChampions,
    getLoLChampionStats,
} from "../lib/api";
import { useApi } from "./useApi";
import type {
    Game,
    Dota2Hero,
    LoLChampion,
    Dota2HeroStats,
    LoLChampionStats,
} from "../types";

export function useMetaHeroes(game: Game): Dota2Hero[] | LoLChampion[] {
    return useApi(
        () => (game === "dota2" ? getDota2Heroes() : getLoLChampions()),
        [game],
    );
}

export function useMetaHeroStats(
    game: Game,
): Dota2HeroStats[] | LoLChampionStats[] {
    return useApi(
        () => (game === "dota2" ? getDota2HeroStats() : getLoLChampionStats()),
        [game],
    );
}
