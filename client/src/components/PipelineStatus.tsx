interface PipelineStatusProps {
    lastRun: string | null; // ISO 8601, or null if unknown
}

// Presentational shell only for now — per Section 13, wiring this to a real
// last-ingestion timestamp is Week 5 Day 4 work, not Week 4. No API endpoint
// currently returns that timestamp; /health just returns { status }. When
// Week 5 gets here, that's a small backend addition (e.g. MAX(match_date)
// from Athena, or CloudWatch's last successful invocation) before this
// component has real data to show.
function PipelineStatus({ lastRun }: PipelineStatusProps) {
    const formatRelativeTime = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const diffInSeconds = Math.floor(
            (now.getTime() - date.getTime()) / 1000,
        );

        // Define units and their thresholds in seconds
        const units: { unit: Intl.RelativeTimeFormatUnit; value: number }[] = [
            { unit: "year", value: 31536000 },
            { unit: "month", value: 2592000 },
            { unit: "week", value: 604800 },
            { unit: "day", value: 86400 },
            { unit: "hour", value: 3600 },
            { unit: "minute", value: 60 },
            { unit: "second", value: 1 },
        ];

        // Find the appropriate unit
        for (const { unit, value } of units) {
            if (Math.abs(diffInSeconds) >= value || unit === "second") {
                const roundedValue = Math.round(diffInSeconds / value);
                const formatter = new Intl.RelativeTimeFormat("en", {
                    numeric: "auto",
                });
                return formatter.format(roundedValue, unit);
            }
        }
        return "just now";
    };
    return (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span
                className={
                    formatRelativeTime(lastRun ?? "") === "just now"
                        ? "h-2 w-2 rounded-full bg-emerald-400"
                        : "h-2 w-2 rounded-full bg-zinc-600"
                }
            />

            <span>{lastRun ? "" : "No ingestion data yet"}</span>
        </div>
    );
}

export default PipelineStatus;
