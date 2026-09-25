import type { HeroChampionStat } from "../types";

interface HeroChampionGridProps {
    stats: HeroChampionStat[];
}

function HeroChampionGrid({ stats }: HeroChampionGridProps) {
    if (stats.length === 0) {
        return <p className="text-sm text-zinc-500">No data available.</p>;
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                    <p className="text-sm font-medium text-zinc-100">
                        {stat.name}
                    </p>
                    <div className="mt-2 flex justify-between text-xs text-zinc-500">
                        <span>Pick — {Math.round(stat.pickRate * 100)}%</span>
                        <span>
                            Win —{" "}
                            {stat.winRate != null
                                ? `${Math.round(stat.winRate * 100)}%`
                                : "—"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HeroChampionGrid;
