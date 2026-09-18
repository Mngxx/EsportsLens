import { useState } from "react";
import GameSelector from "../components/GameSelector";
import MatchTable from "../components/MatchTable";
import Skeleton from "../components/Skeleton";
import { useMatch, useRecentMatches } from "../hooks/useMatches";
import { useMetaHeroes } from "../hooks/useMeta";
import { toMatchRow } from "../lib/derive";
import type {
    Game,
    Dota2Hero,
    Dota2MatchSummary,
    LoLMatchSummary,
} from "../types";

const formatDuration = (duration_secs: number): string => {
    const minutes = Math.floor(duration_secs / 60);
    const seconds = duration_secs % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

function winningTeamLabel(
    match: Dota2MatchSummary | LoLMatchSummary,
    game: Game,
): string {
    if (game === "dota2") {
        const m = match as Dota2MatchSummary;
        return m.winning_team === "radiant" ? "Radiant" : "Dire";
    }

    const m = match as LoLMatchSummary;
    return m.winning_team_id === 100 ? "Blue" : "Red";
}

function Matches() {
    const [game, setGame] = useState<Game>("dota2");
    const [selectedMatchId, setSelectedMatchId] = useState<
        string | number | null
    >(null);

    function handleGameChange(nextGame: Game) {
        setGame(nextGame);
        setSelectedMatchId(null);
    }

    const recent = useRecentMatches(game);
    const heroes = useMetaHeroes(game);
    const matchDetail = useMatch(
        game,
        selectedMatchId ?? "",
        selectedMatchId !== null,
    );

    let dota2HeroLookup: Record<number, string> | undefined;
    if (game === "dota2" && heroes.data) {
        const dota2Heroes = heroes.data as Dota2Hero[];
        dota2HeroLookup = dota2Heroes.reduce<Record<number, string>>(
            (acc, hero) => ({ ...acc, [hero.hero_id]: hero.name }),
            {},
        );
    }

    const matchRows =
        matchDetail.data?.map((m) => toMatchRow(m, game, dota2HeroLookup)) ??
        [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Matches
                </h1>
                <GameSelector value={game} onChange={handleGameChange} />
            </div>

            {!selectedMatchId && (
                <div className="space-y-1">
                    {recent.loading &&
                        Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    {recent.error && (
                        <p className="text-sm text-rose-400">
                            {recent.error.message}
                        </p>
                    )}
                    {!recent.loading && recent.data?.length === 0 && (
                        <p className="text-sm text-zinc-500">
                            No recent matches found.
                        </p>
                    )}
                    {recent.data?.map((match) => (
                        <button
                            key={match.match_id}
                            type="button"
                            onClick={() => setSelectedMatchId(match.match_id)}
                            className="flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-sm hover:border-violet-500"
                        >
                            <span className="text-zinc-100">
                                Match {match.match_id}
                            </span>
                            <span className="flex gap-3 text-zinc-500">
                                <span>{winningTeamLabel(match, game)} won</span>
                                <span>
                                    {formatDuration(match.duration_secs)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {selectedMatchId && (
                <div className="space-y-4">
                    <button
                        type="button"
                        onClick={() => setSelectedMatchId(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                        ← Back to recent matches
                    </button>

                    {matchDetail.loading && (
                        <p className="text-sm text-zinc-500">Loading…</p>
                    )}
                    {matchDetail.error && (
                        <p className="text-sm text-rose-400">
                            {matchDetail.error.message}
                        </p>
                    )}

                    <MatchTable
                        matches={matchRows}
                        loading={matchDetail.loading}
                    />
                </div>
            )}
        </div>
    );
}

export default Matches;
