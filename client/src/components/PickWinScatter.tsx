import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { HeroChampionStat } from "../types";
import type { TooltipContentProps } from "recharts";
interface PickWinScatterProps {
    stats: HeroChampionStat[];
}

function ScatterTooltip({ active, payload }: TooltipContentProps) {
    if (!active || !payload?.length) return null;

    // Recharts nests your actual data object under payload[0].payload
    const point = payload[0].payload as HeroChampionStat & { winRate: number };

    return (
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-xs">
            <p className="font-medium text-zinc-100">{point.name}</p>
            <p className="text-zinc-400">
                Pick: {Math.round(point.pickRate * 100)}%
            </p>
            <p className="text-zinc-400">
                Win: {Math.round(point.winRate * 100)}%
            </p>
        </div>
    );
}

function PickWinScatter({ stats }: PickWinScatterProps) {
    // winRate is nullable for a Dota2 hero with zero pro picks/bans (see
    // schemas.py's field_validator) — Recharts can't plot a null y-value,
    // so those points are dropped rather than breaking the chart.
    const data = stats.filter(
        (s): s is HeroChampionStat & { winRate: number } => s.winRate !== null,
    );

    return (
        <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                    type="number"
                    dataKey="pickRate"
                    name="Pick Rate"
                    stroke="#71717a"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: number) =>
                        `${Math.round(value * 100)}%`
                    }
                />
                <YAxis
                    type="number"
                    dataKey="winRate"
                    name="Win Rate"
                    stroke="#71717a"
                    tick={{ fontSize: 12 }}
                />
                <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={ScatterTooltip}
                />
                <Scatter data={data} fill="#c084fc" />
            </ScatterChart>
        </ResponsiveContainer>
    );
}

export default PickWinScatter;
