export const API_URL = import.meta.env.VITE_API_URL;
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}
export function setLimit(limit: number): number {
    const effectiveLimit = limit ?? 10;
    if (effectiveLimit > 50) {
        throw new ApiError(422, "limit must be <= 50");
    }
    return effectiveLimit;
}

export function checkName(name: string): void {
    if (name.length < 3) {
        throw new ApiError(422, "name must be at least 3 characters");
    }
}
