import PipelineStatus from "../components/PipelineStatus";
import {
    useDota2DashboardSummary,
    useLoLDashboardSummary,
} from "../hooks/useDashboard";
import { useMetaHeroes } from "../hooks/useMeta";
import type { Dota2Hero } from "../types";

function Dashboard() {
    const dota2 = useDota2DashboardSummary();
    const lol = useLoLDashboardSummary();
    const dota2Heroes = useMetaHeroes("dota2");

    let dota2HeroLookup: Record<number, string> | undefined;
    if (dota2Heroes.data) {
        const heroes = dota2Heroes.data as Dota2Hero[];
        dota2HeroLookup = heroes.reduce<Record<number, string>>(
            (acc, hero) => ({ ...acc, [hero.hero_id]: hero.name }),
            {},
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Dashboard
                </h1>
                {/* lastRun stays null until Week 5 Day 4 wires up a real
                    last-ingestion timestamp (see Section 15, Technical Debt) */}
                <PipelineStatus lastRun={null} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <section className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <h2 className="text-sm font-medium text-zinc-400">
                        Dota 2
                    </h2>

                    {dota2.loading && (
                        <p className="text-sm text-zinc-500">Loading…</p>
                    )}
                    {dota2.error && (
                        <p className="text-sm text-rose-400">
                            {dota2.error.message}
                        </p>
                    )}

                    {dota2.data && (
                        <>
                            <div>
                                <p className="text-3xl font-semibold text-zinc-100">
                                    {dota2.data.matches_today}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    matches today
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-xs font-medium text-zinc-500">
                                    Top 5 by KDA this week
                                </h3>
                                <ul className="space-y-1 text-sm text-zinc-300">
                                    {dota2.data.top_players_by_kda.map((p) => (
                                        <li
                                            key={p.account_id}
                                            className="flex justify-between"
                                        >
                                            <span>{p.player_name}</span>
                                            <span>{p.avg_kda.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-xs font-medium text-zinc-500">
                                    Most picked hero this week
                                </h3>
                                {dota2.data.most_picked_hero ? (
                                    <p className="text-sm text-zinc-300">
                                        Hero #{dota2HeroLookup?.[heroId] ?? ""}
                                        {dota2.data.most_picked_hero.hero_id} —{" "}
                                        {dota2.data.most_picked_hero.pick_count}{" "}
                                        picks
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-500">
                                        No data yet.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </section>

                <section className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                    <h2 className="text-sm font-medium text-zinc-400">
                        League of Legends
                    </h2>

                    {lol.loading && (
                        <p className="text-sm text-zinc-500">Loading…</p>
                    )}
                    {lol.error && (
                        <p className="text-sm text-rose-400">
                            {lol.error.message}
                        </p>
                    )}

                    {lol.data && (
                        <>
                            <div>
                                <p className="text-3xl font-semibold text-zinc-100">
                                    {lol.data.matches_today}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    matches today
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-xs font-medium text-zinc-500">
                                    Top 5 by KDA this week
                                </h3>
                                <ul className="space-y-1 text-sm text-zinc-300">
                                    {lol.data.top_players_by_kda.map((p) => (
                                        <li
                                            key={p.puuid}
                                            className="flex justify-between"
                                        >
                                            <span>{p.player_name}</span>
                                            <span>{p.avg_kda.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="mb-2 mt-4 text-xs font-medium text-zinc-500">
                                    Most picked champion this week
                                </h3>
                                {lol.data.most_picked_champion ? (
                                    <p className="text-sm text-zinc-300">
                                        {
                                            lol.data.most_picked_champion
                                                .champion_name
                                        }{" "}
                                        —{" "}
                                        {
                                            lol.data.most_picked_champion
                                                .pick_count
                                        }{" "}
                                        picks
                                    </p>
                                ) : (
                                    <p className="text-sm text-zinc-500">
                                        No data yet.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
