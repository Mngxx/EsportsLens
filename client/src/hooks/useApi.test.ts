import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useApi } from "./useApi";

describe("useApi", () => {
    it("starts in a loading state and resolves with data", async () => {
        const fetchFn = vi.fn().mockResolvedValue({ hello: "world" });

        const { result } = renderHook(() => useApi(fetchFn, []));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.data).toEqual({ hello: "world" });
        expect(result.current.error).toBeNull();
        expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it("captures a rejected promise as an Error", async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useApi(fetchFn, []));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("boom");
    });

    it("wraps a non-Error rejection in an Error", async () => {
        const fetchFn = vi.fn().mockRejectedValue("string rejection");

        const { result } = renderHook(() => useApi(fetchFn, []));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe("string rejection");
    });

    it("never calls fetchFn when enabled is false", async () => {
        const fetchFn = vi.fn().mockResolvedValue({ hello: "world" });

        const { result } = renderHook(() => useApi(fetchFn, [], false));

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBeNull();
        expect(fetchFn).not.toHaveBeenCalled();
    });

    it("refetches when deps change", async () => {
        const fetchFn = vi.fn().mockResolvedValue({ ok: true });

        const { rerender } = renderHook(({ dep }) => useApi(fetchFn, [dep]), {
            initialProps: { dep: 1 },
        });
        await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));

        act(() => rerender({ dep: 2 }));
        await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2));
    });

    it("ignores a stale in-flight response after unmount (the cancelled-flag race guard)", async () => {
        let resolveFetch: (value: { ok: boolean }) => void;
        const fetchFn = vi.fn(
            () =>
                new Promise<{ ok: boolean }>((resolve) => {
                    resolveFetch = resolve;
                }),
        );
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const { result, unmount } = renderHook(() => useApi(fetchFn, []));

        await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(1));
        expect(result.current.loading).toBe(true);

        unmount();
        await act(async () => {
            resolveFetch({ ok: true });
            // flush the resolved microtask through useApi's .then() handler
            await Promise.resolve();
        });

        expect(consoleError).not.toHaveBeenCalled();
        consoleError.mockRestore();
    });
});
