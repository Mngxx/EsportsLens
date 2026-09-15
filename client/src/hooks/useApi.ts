import { useEffect, useState, type DependencyList } from "react";

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Generic data-fetching hook — usePlayers/useMatches/useMeta should each be a
 * thin wrapper around this, calling a specific lib/api.ts function.
 *
 * `fetchFn` is called on mount and whenever `deps` changes (same rules as
 * useEffect's dependency array — pass the actual primitive values the fetch
 * depends on, e.g. [accountId, limit], NOT the fetchFn itself, since a new
 * inline arrow function has a different identity every render).
 *
 * `enabled` lets a caller skip fetching entirely (e.g. the Players page
 * before any player has been selected/searched) — when false, returns the
 * initial idle state and never calls fetchFn.
 */
export function useApi<T>(
    fetchFn: () => Promise<T>,
    deps: DependencyList,
    enabled: boolean = true,
): UseApiState<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: enabled,
        error: null,
    });

    useEffect(() => {
        if (!enabled) {
            setState({ data: null, loading: false, error: null });
            return;
        }

        let cancelled = false;
        setState({ data: null, loading: true, error: null });

        fetchFn()
            .then((data) => {
                if (!cancelled) setState({ data, loading: false, error: null });
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({
                        data: null,
                        loading: false,
                        error:
                            error instanceof Error
                                ? error
                                : new Error(String(error)),
                    });
                }
            });

        return () => {
            cancelled = true;
        };
        // fetchFn is intentionally excluded — callers pass a new inline closure
        // each render, deps carries the actual values that should trigger a refetch.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps]);

    return state;
}
