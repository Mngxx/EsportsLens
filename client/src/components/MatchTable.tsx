import { useMemo, useState } from "react";
import Skeleton from "./Skeleton";
import type { MatchRow } from "../types";

interface MatchTableProps {
    matches: MatchRow[];
    loading?: boolean;
}

const SKELETON_ROW_COUNT = 5;

type SortColumn = "result" | "character" | "kda" | "date";
type SortDirection = "asc" | "desc";

interface SortState {
    column: SortColumn;
    direction: SortDirection;
}

const COLUMNS: { key: SortColumn; label: string }[] = [
    { key: "result", label: "Result" },
    { key: "character", label: "Hero/Champion" },
    { key: "kda", label: "K/D/A" },
    { key: "date", label: "Date" },
];

function kdaRatio(match: MatchRow): number {
    return (match.kills + match.assists) / Math.max(match.deaths, 1);
}

function sortValue(match: MatchRow, column: SortColumn): number | string {
    switch (column) {
        case "result":
            return match.win ? 1 : 0;
        case "character":
            return match.characterName.toLowerCase();
        case "kda":
            return kdaRatio(match);
        case "date":
            return match.matchDate;
    }
}

function sortMatches(matches: MatchRow[], sort: SortState | null): MatchRow[] {
    if (!sort) return matches;

    const factor = sort.direction === "asc" ? 1 : -1;
    return [...matches].sort((a, b) => {
        const aValue = sortValue(a, sort.column);
        const bValue = sortValue(b, sort.column);
        if (aValue < bValue) return -1 * factor;
        if (aValue > bValue) return 1 * factor;
        return 0;
    });
}

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
    const [sort, setSort] = useState<SortState | null>(null);

    function handleSort(column: SortColumn) {
        setSort((current) => {
            if (current?.column !== column) {
                return { column, direction: "asc" };
            }
            return {
                column,
                direction: current.direction === "asc" ? "desc" : "asc",
            };
        });
    }

    const sortedMatches = useMemo(
        () => sortMatches(matches, sort),
        [matches, sort],
    );

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500">
                            <th className="py-2 font-medium">Result</th>
                            <th className="py-2 font-medium">
                                Hero/Champion
                            </th>
                            <th className="py-2 font-medium">K/D/A</th>
                            <th className="py-2 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: SKELETON_ROW_COUNT }).map(
                            (_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-zinc-900"
                                >
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
            </div>
        );
    }

    if (matches.length === 0) {
        return <p className="text-sm text-zinc-500">No matches found.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                        {COLUMNS.map(({ key, label }) => {
                            const isSorted = sort?.column === key;
                            return (
                                <th key={key} className="py-2 font-medium">
                                    <button
                                        type="button"
                                        onClick={() => handleSort(key)}
                                        aria-sort={
                                            isSorted
                                                ? sort.direction === "asc"
                                                    ? "ascending"
                                                    : "descending"
                                                : "none"
                                        }
                                        className="flex items-center gap-1 hover:text-zinc-300"
                                    >
                                        {label}
                                        <span className="text-[10px]">
                                            {isSorted
                                                ? sort.direction === "asc"
                                                    ? "▲"
                                                    : "▼"
                                                : ""}
                                        </span>
                                    </button>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sortedMatches.map((match) => (
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
        </div>
    );
}

export default MatchTable;
