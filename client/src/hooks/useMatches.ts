import { getDota2PlayerMatches, getLolPlayerMatches } from "../lib/api";
import { useApi } from "./useApi";
import type { Game } from "../types";

export function usePlayerMatches(
    game: Game,
    id: string | number,
    limit?: number,
) {
    return useApi(
        () =>
            game === "dota2"
                ? getDota2PlayerMatches(id as number, limit)
                : getLolPlayerMatches(id as number, limit),
        [game, id, limit],
    );
}
