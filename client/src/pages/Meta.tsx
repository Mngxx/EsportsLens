import { useState } from "react";
import GameSelector from "../components/GameSelector";
import PickWinScatter from "../components/PickWinScatter";
import HeroChampionGrid from "../components/HeroChampionGrid";
import Skeleton from "../components/Skeleton";
import { useMetaHeroStats } from "../hooks/useMeta";
import { toHeroChampionStat } from "../lib/derive";
import type { Game, HeroChampionStat } from "../types";

function Meta() {
    const [game, setGame] = useState<Game>("dota2");
    const heroStats = useMetaHeroStats(game);

    const stats: HeroChampionStat[] =
        heroStats.data?.map((s) => toHeroChampionStat(s, game)) ?? [];

    const withWinRate = stats.filter(
        (s): s is HeroChampionStat & { winRate: number } => s.winRate !== null,
    );

    const topByWinRate: HeroChampionStat[] = [...withWinRate]
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 10);
    const topByPickRate: HeroChampionStat[] = [...stats]
        .sort((a, b) => b.pickRate - a.pickRate)
        .slice(0, 10);

    const highPickPool = [...withWinRate]
        .sort((a, b) => b.pickRate - a.pickRate)
        .slice(0, 10);
    const traps: HeroChampionStat[] = [...highPickPool]
        .sort((a, b) => a.winRate - b.winRate)
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-100">Meta</h1>
                <GameSelector value={game} onChange={setGame} />
            </div>

            {heroStats.error && (
                <p className="text-sm text-rose-400">
                    {heroStats.error.message}
                </p>
            )}

            {heroStats.loading ? (
                <Skeleton className="h-72 w-full" />
            ) : (
                <section>
                    <h2 className="mb-3 text-sm font-medium text-zinc-400">
                        Pick Rate vs Win Rate
                    </h2>
                    <PickWinScatter stats={stats} />
                </section>
            )}

            {heroStats.loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : (
                <section>
                    <h2 className="mb-3 text-sm font-medium text-zinc-400">
                        Top 10 by Win Rate
                    </h2>
                    <HeroChampionGrid stats={topByWinRate} />
                </section>
            )}

            {heroStats.loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            ) : (
                <section>
                    <h2 className="mb-3 text-sm font-medium text-zinc-400">
                        Top 10 by Pick Rate
                    </h2>
                    <HeroChampionGrid stats={topByPickRate} />
                </section>
            )}

            <section>
                <h2 className="mb-3 text-sm font-medium text-zinc-400">
                    Hidden Traps
                </h2>
                <p className="mb-3 text-xs text-zinc-500">
                    High pick rate, poor win rate.
                </p>
                <HeroChampionGrid stats={traps} />
            </section>
        </div>
    );
}

export default Meta;
