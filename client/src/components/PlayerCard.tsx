import type { Game } from "../types";

interface PlayerStats {
    winRate: number; // 0-1
    avgKda: number;
    matchesPlayed: number;
}

interface PlayerCardProps {
    game: Game;
    playerName: string;
    stats: PlayerStats;
}

// NOTE: stats isn't something any endpoint returns directly — Section 7 only
// has per-match rows (Dota2Match[]/LoLMatch[]). This card expects the caller
// to have already reduced a fetched match list into { winRate, avgKda,
// matchesPlayed } (e.g. inside usePlayers, Day 3) rather than doing that math
// here — keeps PlayerCard a pure presentational component.
function PlayerCard({ game, playerName, stats }: PlayerCardProps) {
    const formatPercentage = (num: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "percent",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num / 100);
    };
    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">
                    {playerName}
                </h3>
                <span className="text-xs uppercase tracking-wide text-zinc-500">
                    {game === "dota2" ? "Dota 2" : "League of Legends"}
                </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <dt className="text-xs text-zinc-500">Win Rate</dt>
                    <dd className="text-lg font-medium text-zinc-100">
                        {formatPercentage(stats.winRate)}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-zinc-500">Avg KDA</dt>
                    <dd className="text-lg font-medium text-zinc-100">
                        {stats.avgKda.toFixed(2)}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-zinc-500">Matches</dt>
                    <dd className="text-lg font-medium text-zinc-100">
                        {stats.matchesPlayed}
                    </dd>
                </div>
            </dl>
        </div>
    );
}

export default PlayerCard;
