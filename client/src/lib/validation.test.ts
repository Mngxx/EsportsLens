import { describe, expect, it } from "vitest";
import { ApiError, checkName, setLimit } from "./validation";

describe("setLimit", () => {
    it("returns the given limit when under the max", () => {
        expect(setLimit(25)).toBe(25);
    });

    it("defaults to 10 when limit is undefined", () => {
        expect(setLimit(undefined)).toBe(10);
    });

    it("throws an ApiError when limit exceeds 50", () => {
        expect(() => setLimit(51)).toThrow(ApiError);
    });

    it("allows exactly 50", () => {
        expect(setLimit(50)).toBe(50);
    });
});

describe("checkName", () => {
    it("does not throw for a name with 3+ characters", () => {
        expect(() => checkName("abc")).not.toThrow();
    });

    it("throws an ApiError for a name under 3 characters", () => {
        expect(() => checkName("ab")).toThrow(ApiError);
    });
});
