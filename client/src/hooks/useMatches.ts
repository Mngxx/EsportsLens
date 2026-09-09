import { getDota2PlayerMatches, getLoLPlayerMatches } from "../lib/api";
import { useApi } from "./useApi";
import type { Game, Dota2Match, LoLMatch } from "../types";

export function usePlayerMatches(
    game: Game,
    id: string | number,
    limit?: number,
) {
    return useApi<Dota2Match[] | LoLMatch[]>(
        () =>
            game === "dota2"
                ? getDota2PlayerMatches(id as number, limit)
                : getLoLPlayerMatches(id as string, limit),
        [game, id, limit],
    );
}
