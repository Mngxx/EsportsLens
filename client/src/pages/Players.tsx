import { lazy, Suspense, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameSelector from "../components/GameSelector";
import SearchBar from "../components/SearchBar";
import PlayerCard from "../components/PlayerCard";
import MatchTable from "../components/MatchTable";
import Skeleton from "../components/Skeleton";
import { usePlayerSearch } from "../hooks/usePlayers";
import { usePlayerMatches } from "../hooks/useMatches";
import { useMetaHeroes } from "../hooks/useMeta";
import {
    useDota2DashboardSummary,
    useLoLDashboardSummary,
} from "../hooks/useDashboard";
import { derivePlayerStats, toMatchRow } from "../lib/derive";
import type {
    Dota2Hero,
    Dota2PlayerSearchResult,
    Dota2TopPlayer,
    Game,
    LoLPlayerSearchResult,
    LoLTopPlayer,
} from "../types";

interface SelectedPlayer {
    id: string | number;
    name: string;
}

const KDATrendLine = lazy(() => import("../components/KDATrendLine"));

function Players() {
    // Supports deep-linking from Dashboard's top-KDA list — ?game=&id=&name=
    // pre-selects a player on load instead of requiring a fresh search.
    const [searchParams] = useSearchParams();
    const linkedGame = searchParams.get("game");
    const linkedId = searchParams.get("id");
    const linkedName = searchParams.get("name");

    const [game, setGame] = useState<Game>(
        linkedGame === "lol" ? "lol" : "dota2",
    );
    const [query, setQuery] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState<SelectedPlayer | null>(
        linkedId && linkedName
            ? {
                  id: linkedGame === "lol" ? linkedId : Number(linkedId),
                  name: linkedName,
              }
            : null,
    );

    function handleGameChange(nextGame: Game) {
        setGame(nextGame);
        setQuery("");
        setSelectedPlayer(null);
    }

    const search = usePlayerSearch(game, query);
    const heroes = useMetaHeroes(game);
    // Top performers = same "top 5 by avg KDA this week" data the Dashboard
    // already shows — one definition of "top," not a second one invented here.
    const dota2Summary = useDota2DashboardSummary();
    const lolSummary = useLoLDashboardSummary();
    const topPerformers =
        game === "dota2"
            ? (dota2Summary.data?.top_players_by_kda ?? [])
            : (lolSummary.data?.top_players_by_kda ?? []);
    const matches = usePlayerMatches(
        game,
        selectedPlayer?.id ?? "",
        10,
        selectedPlayer !== null,
    );

    let dota2HeroLookup: Record<number, string> | undefined;
    if (game === "dota2" && heroes.data) {
        const dota2Heroes = heroes.data as Dota2Hero[];
        dota2HeroLookup = dota2Heroes.reduce<Record<number, string>>(
            (acc, hero) => ({ ...acc, [hero.hero_id]: hero.localized_name }),
            {},
        );
    }

    const matchRows =
        matches.data?.map((m) => toMatchRow(m, game, dota2HeroLookup)) ?? [];
    const stats = matches.data ? derivePlayerStats(matches.data, game) : null;

    function handleSelectResult(id: string | number, name: string) {
        setSelectedPlayer({ id, name });
    }

    function handleSearch(newQuery: string) {
        setQuery(newQuery);
        setSelectedPlayer(null);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Players
                </h1>
                <GameSelector value={game} onChange={handleGameChange} />
            </div>

            <SearchBar
                onSearch={handleSearch}
                placeholder={
                    game === "dota2"
                        ? "Search Dota 2 players…"
                        : "Search LoL players…"
                }
            />

            {!query && !selectedPlayer && (
                <div className="space-y-1">
                    <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Top Performers This Week
                    </h2>
                    {topPerformers.length === 0 && (
                        <p className="text-sm text-zinc-500">No data yet.</p>
                    )}
                    {topPerformers.map((p) => {
                        const id =
                            game === "dota2"
                                ? (p as Dota2TopPlayer).account_id
                                : (p as LoLTopPlayer).puuid;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() =>
                                    handleSelectResult(id, p.player_name)
                                }
                                className="flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-left text-sm text-zinc-100 hover:border-violet-500"
                            >
                                <span>{p.player_name}</span>
                                <span className="text-zinc-500">
                                    {p.avg_kda.toFixed(2)} KDA
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

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
                            <Suspense
                                fallback={<Skeleton className="h-60 w-full" />}
                            >
                                <KDATrendLine matches={matchRows} />
                            </Suspense>
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
