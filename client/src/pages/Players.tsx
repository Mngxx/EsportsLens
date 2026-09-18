import { useState } from "react";
import GameSelector from "../components/GameSelector";
import SearchBar from "../components/SearchBar";
import PlayerCard from "../components/PlayerCard";
import MatchTable from "../components/MatchTable";
import KDATrendLine from "../components/KDATrendLine";
import Skeleton from "../components/Skeleton";
import { usePlayerSearch } from "../hooks/usePlayers";
import { usePlayerMatches } from "../hooks/useMatches";
import { useMetaHeroes } from "../hooks/useMeta";
import { derivePlayerStats, toMatchRow } from "../lib/derive";
import type {
    Dota2Hero,
    Dota2PlayerSearchResult,
    Game,
    LoLPlayerSearchResult,
} from "../types";

interface SelectedPlayer {
    id: string | number;
    name: string;
}

function Players() {
    const [game, setGame] = useState<Game>("dota2");
    const [query, setQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
        null,
    );

    // Switching games invalidates both the current search results and
    // whichever player was selected under the old game — a Dota2 account_id
    // means nothing as a LoL puuid, and vice versa.
    function handleGameChange(nextGame: Game) {
        setGame(nextGame);
        setQuery("");
        setSelectedPlayer(null);
    }

    const search = usePlayerSearch(game, query);
    const heroes = useMetaHeroes(game);
    const matches = usePlayerMatches(
        game,
        selectedPlayer?.id ?? "",
        10,
        selectedPlayer !== null,
    );

    // LoL doesn't need this — LoLMatch already has champion_name built in.
    // heroes.data's type covers both games, so cast it to Dota2Hero[] once
    // we know (via the `if`) that we're actually looking at Dota2 heroes.
    let dota2HeroLookup: Record<number, string> | undefined;
    if (game === "dota2" && heroes.data) {
        const dota2Heroes = heroes.data as Dota2Hero[];
        dota2HeroLookup = dota2Heroes.reduce<Record<number, string>>(
            (acc, hero) => ({ ...acc, [hero.hero_id]: hero.name }),
            {},
        );
    }


    const matchRows =
        matches.data?.map((m) => toMatchRow(m, game, dota2HeroLookup)) ?? [];
    const stats = matches.data ? derivePlayerStats(matches.data, game) : null;

    function handleSelectResult(id: string | number, name: string) {
        setSelectedPlayer({ id, name });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Players
                </h1>
                <GameSelector value={game} onChange={handleGameChange} />
            </div>

            <SearchBar
                onSearch={setQuery}
                placeholder={
                    game === "dota2"
                        ? "Search Dota 2 players…"
                        : "Search LoL players…"
                }
            />

            {query && !selectedPlayer && (
                <div className="space-y-1">
                    {search.loading &&
                        Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-9 w-full" />
                        ))}
                    {search.error && (
                        <p className="text-sm text-rose-400">
                            {search.error.message}
                        </p>
                    )}
                    {search.data?.length === 0 && (
                        <p className="text-sm text-zinc-500">
                            No players found.
                        </p>
                    )}
                    {search.data?.map((result) => {
                        // Same cast-based-on-game pattern as above — the
                        // search result's id field name differs per game
                        // (account_id vs puuid), and `game` doesn't narrow
                        // the union type automatically.
                        const id =
                            game === "dota2"
                                ? (result as Dota2PlayerSearchResult).account_id
                                : (result as LoLPlayerSearchResult).puuid;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() =>
                                    handleSelectResult(id, result.player_name)
                                }
                                className="block w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-100 hover:border-violet-500"
                            >
                                {result.player_name}
                            </button>
                        );
                    })}
                </div>
            )}

            {selectedPlayer && (
                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={() => setSelectedPlayer(null)}
                        className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                        ← Back to search
                    </button>

                    {matches.loading && (
                        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-full" />
                                ))}
                            </div>
                        </div>
                    )}
                    {matches.error && (
                        <p className="text-sm text-rose-400">
                            {matches.error.message}
                        </p>
                    )}

                    {stats && (
                        <PlayerCard
                            game={game}
                            playerName={selectedPlayer.name}
                            stats={stats}
                        />
                    )}

                    {(matches.loading || matchRows.length > 0) && (
                        <>
                            <KDATrendLine matches={matchRows} />
                            <MatchTable
                                matches={matchRows}
                                loading={matches.loading}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default Players;
