import { searchDota2Players, searchLoLPlayers } from "../lib/api";
import { useApi } from "./useApi";
import type {
    Game,
    Dota2PlayerSearchResult,
    LoLPlayerSearchResult,
} from "../types";

export function usePlayerSearch(game: Game, name: string, limit?: number) {
    return useApi<Dota2PlayerSearchResult[] | LoLPlayerSearchResult[]>(
        () =>
            game === "dota2"
                ? searchDota2Players(name, limit)
                : searchLoLPlayers(name, limit),
        [game, name, limit],
        name.length >= 3,
    );
}
