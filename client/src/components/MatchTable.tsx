import { useMemo, useState } from "react";
import Skeleton from "./Skeleton";
import type { Game, MatchRow } from "../types";

interface MatchTableProps {
    matches: MatchRow[];
    loading?: boolean;
}

const SKELETON_ROW_COUNT = 5;

type SortColumn =
    | "player"
    | "result"
    | "character"
    | "kda"
    | "lastHits"
    | "gold"
    | "damage"
    | "level"
    | "date";
type SortDirection = "asc" | "desc";

interface SortState {
    column: SortColumn;
    direction: SortDirection;
}

// LoL's "cs" is last hits, no separate denies concept — Dota2's column shows
// "last hits/denies" (e.g. "200/10"), so the header label differs per game.
function getColumns(
    game: Game | undefined,
): { key: SortColumn; label: string }[] {
    return [
        { key: "player", label: "Player" },
        { key: "result", label: "Result" },
        { key: "character", label: "Hero/Champion" },
        { key: "kda", label: "K/D/A" },
        {
            key: "lastHits",
            label: game === "lol" ? "Last Hits" : "Last Hit/Denies",
        },
        { key: "gold", label: "Gold" },
        { key: "damage", label: "Damage" },
        { key: "level", label: "Level" },
        { key: "date", label: "Date" },
    ];
}

function kdaRatio(match: MatchRow): number {
    return (match.kills + match.assists) / Math.max(match.deaths, 1);
}

function sortValue(match: MatchRow, column: SortColumn): number | string {
    switch (column) {
        case "player":
            return match.playerName.toLowerCase();
        case "result":
            return match.win ? 1 : 0;
        case "character":
            return match.characterName.toLowerCase();
        case "kda":
            return kdaRatio(match);
        case "lastHits":
            return match.lastHits;
        case "gold":
            return match.gold;
        case "damage":
            return match.damage;
        case "level":
            return match.level;
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

function teamLabel(team: MatchRow["team"]): string {
    return team.charAt(0).toUpperCase() + team.slice(1);
}

interface TableBodyProps {
    matches: MatchRow[];
    sort: SortState | null;
    onSort: (column: SortColumn) => void;
}

const COLUMN_WIDTHS: Record<SortColumn, string> = {
    player: "14%",
    result: "8%",
    character: "14%",
    kda: "11%",
    lastHits: "10%",
    gold: "11%",
    damage: "11%",
    level: "7%",
    date: "14%",
};

function MatchTableRows({ matches, sort, onSort }: TableBodyProps) {
    const columns = getColumns(matches[0]?.game);
    return (
        <table className="w-full min-w-[860px] table-fixed text-left text-sm">
            <colgroup>
                {columns.map(({ key }) => (
                    <col key={key} style={{ width: COLUMN_WIDTHS[key] }} />
                ))}
            </colgroup>
            <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                    {columns.map(({ key, label }) => {
                        const isSorted = sort?.column === key;
                        return (
                            <th key={key} className="py-2 font-medium">
                                <button
                                    type="button"
                                    onClick={() => onSort(key)}
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
                {matches.map((match) => (
                    <tr
                        key={match.matchId + match.playerName}
                        className="border-b border-zinc-900"
                    >
                        <td className="truncate py-2 text-zinc-100">
                            {match.playerName}
                        </td>
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
                        <td className="truncate py-2 text-zinc-100">
                            {match.characterName}
                        </td>
                        <td className="py-2 text-zinc-300">
                            {match.kills}/{match.deaths}/{match.assists}
                        </td>
                        <td className="py-2 text-zinc-300">
                            {match.game === "dota2"
                                ? `${match.lastHits}/${match.denies}`
                                : match.lastHits}
                        </td>
                        <td className="py-2 text-zinc-300">
                            {match.gold.toLocaleString()}
                        </td>
                        <td className="py-2 text-zinc-300">
                            {match.damage.toLocaleString()}
                        </td>
                        <td className="py-2 text-zinc-300">{match.level}</td>
                        <td className="py-2 text-zinc-500">
                            {toISODateTime(match.matchDate)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
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

    // Matches.tsx passes every player from ONE match (splitting by team is
    // meaningful there); Players.tsx passes one player's history across MANY
    // different matches (splitting by team would be meaningless there) —
    // detect which case this is rather than needing a prop from the caller.
    const isSingleMatch =
        matches.length > 0 &&
        matches.every((m) => m.matchId === matches[0].matchId);

    if (loading) {
        return (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] table-fixed text-left text-sm">
                    <colgroup>
                        {getColumns(undefined).map(({ key }) => (
                            <col
                                key={key}
                                style={{ width: COLUMN_WIDTHS[key] }}
                            />
                        ))}
                    </colgroup>
                    <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500">
                            {getColumns(undefined).map(({ key, label }) => (
                                <th key={key} className="py-2 font-medium">
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: SKELETON_ROW_COUNT }).map(
                            (_, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-zinc-900"
                                >
                                    {getColumns(undefined).map(({ key }) => (
                                        <td key={key} className="py-2">
                                            <Skeleton className="h-4 w-4/5" />
                                        </td>
                                    ))}
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

    if (isSingleMatch) {
        const teams = [...new Set(sortedMatches.map((m) => m.team))];
        return (
            <div className="space-y-6">
                {teams.map((team) => (
                    <div key={team} className="overflow-x-auto">
                        <h3 className="mb-2 text-sm font-medium text-zinc-400">
                            {teamLabel(team)}
                        </h3>
                        <MatchTableRows
                            matches={sortedMatches.filter(
                                (m) => m.team === team,
                            )}
                            sort={sort}
                            onSort={handleSort}
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <MatchTableRows
                matches={sortedMatches}
                sort={sort}
                onSort={handleSort}
            />
        </div>
    );
}

export default MatchTable;
