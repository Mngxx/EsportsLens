import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { MatchRow } from "../types";

interface KDATrendLineProps {
    matches: MatchRow[];
}

function KDATrendLine({ matches }: KDATrendLineProps) {
    // usePlayerMatches returns most-recent-first (API's ORDER BY match_date
    // DESC) — reverse so the line reads chronologically left-to-right.
    const data = [...matches].reverse().map((m) => ({
        date: m.matchDate,
        kda: (m.kills + m.assists) / Math.max(m.deaths, 1),
    }));

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: string) =>
                        new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                    }
                />
                <YAxis stroke="#71717a" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        background: "#18181b",
                        border: "1px solid #27272a",
                    }}
                    labelStyle={{ color: "#a1a1aa" }}
                />
                <Line
                    type="monotone"
                    dataKey="kda"
                    stroke="#c084fc"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

export default KDATrendLine;
