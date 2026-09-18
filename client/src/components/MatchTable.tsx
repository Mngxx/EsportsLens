import Skeleton from "./Skeleton";
import type { MatchRow } from "../types";

interface MatchTableProps {
    matches: MatchRow[];
    loading?: boolean;
}

const SKELETON_ROW_COUNT = 5;

// Section 11 calls for a "sortable match history table" — not wired up yet.
// When you get to it: sort client-side (matches is already a bounded page
// from the API's `limit`, not the full history), track sort column + direction
// in local state, and sort a copy of `matches` before mapping — don't mutate
// the prop array in place.

function toISODateTime(date: string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(date));
}

function MatchTable({ matches, loading }: MatchTableProps) {
    if (loading) {
        return (
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="py-2 font-medium">Result</th>
                        <th className="py-2 font-medium">Hero/Champion</th>
                        <th className="py-2 font-medium">K/D/A</th>
                        <th className="py-2 font-medium">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: SKELETON_ROW_COUNT }).map(
                        (_, i) => (
                            <tr key={i} className="border-b border-zinc-900">
                                <td className="py-2">
                                    <Skeleton className="h-4 w-12" />
                                </td>
                                <td className="py-2">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="py-2">
                                    <Skeleton className="h-4 w-16" />
                                </td>
                                <td className="py-2">
                                    <Skeleton className="h-4 w-32" />
                                </td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        );
    }

    if (matches.length === 0) {
        return <p className="text-sm text-zinc-500">No matches found.</p>;
    }

    return (
        <table className="w-full text-left text-sm">
            <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 font-medium">Result</th>
                    <th className="py-2 font-medium">Hero/Champion</th>
                    <th className="py-2 font-medium">K/D/A</th>
                    <th className="py-2 font-medium">Date</th>
                </tr>
            </thead>
            <tbody>
                {matches.map((match) => (
                    <tr
                        key={match.matchId}
                        className="border-b border-zinc-900"
                    >
                        <td className="py-2">
                            <span
                                className={
                                    match.win
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }
                            >
                                {match.win ? "Win" : "Loss"}
                            </span>
                        </td>
                        <td className="py-2 text-zinc-100">
                            {match.characterName}
                        </td>
                        <td className="py-2 text-zinc-300">
                            {match.kills}/{match.deaths}/{match.assists}
                        </td>
                        <td className="py-2 text-zinc-500">
                            {toISODateTime(match.matchDate)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default MatchTable;
