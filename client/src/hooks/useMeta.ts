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

export function useMetaHeroes(game: Game) {
    return useApi<Dota2Hero[] | LoLChampion[]>(
        () => (game === "dota2" ? getDota2Heroes() : getLoLChampions()),
        [game],
    );
}

export function useMetaHeroStats(game: Game) {
    return useApi<Dota2HeroStats[] | LoLChampionStats[]>(
        () => (game === "dota2" ? getDota2HeroStats() : getLoLChampionStats()),
        [game],
    );
}
