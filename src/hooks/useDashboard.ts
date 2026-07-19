"use client";

import { useState, useEffect, useCallback } from "react";
import { DASHBOARD_POLL_INTERVAL_MS } from "../constants";
import type { DashboardResponse } from "../types";

interface DashboardHook {
  dashboard: DashboardResponse | null;
  isLoading: boolean;
}

/**
 * Fetches dashboard telemetry data and polls for updates on a fixed interval.
 *
 * @param venueId - The selected venue identifier.
 */
export function useDashboard(venueId: string): DashboardHook {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(
    (silent = false) => {
      if (!silent) setIsLoading(true);

      fetch(`/api/dashboard/${venueId}`)
        .then((res) => res.json())
        .then((data: DashboardResponse & { error?: string }) => {
          if (!data.error) setDashboard(data);
        })
        .catch((err) => console.error("Error fetching dashboard:", err))
        .finally(() => {
          if (!silent) setIsLoading(false);
        });
    },
    [venueId]
  );

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(() => {
      fetchDashboard(true);
    }, DASHBOARD_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  return { dashboard, isLoading };
}
