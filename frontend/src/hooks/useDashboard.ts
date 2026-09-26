import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

/** Query keys for the admin dashboard summary (under ["admin", ...]). */
export const dashboardKeys = {
  /** Base key for all admin dashboard queries. */
  all: ["admin", "dashboard"] as const,
  /** Key for the summary query. */
  summary: ["admin", "dashboard", "summary"] as const,
};

/**
 * Fetches the admin dashboard summary with a 60s stale window.
 * @returns summary query result (one GET per mount, single retry)
 */
export const useAdminDashboardSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: () => dashboardService.getSummary(),
    staleTime: 60_000,
    retry: 1,
  });
};
