import { getDota2DashboardSummary, getLoLDashboardSummary } from "../lib/api";
import { useApi } from "./useApi";
import type { Dota2DashboardSummary, LoLDashboardSummary } from "../types";

export function useDota2DashboardSummary() {
    return useApi<Dota2DashboardSummary>(() => getDota2DashboardSummary(), []);
}

export function useLoLDashboardSummary() {
    return useApi<LoLDashboardSummary>(() => getLoLDashboardSummary(), []);
}
