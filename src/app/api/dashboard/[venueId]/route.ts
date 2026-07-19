import { NextRequest, NextResponse } from "next/server";
import { getVenue, getOperations, getAnalytics, getMatchSchedule } from "@/lib/dataStore";
import { DENSITY_THRESHOLDS, WAIT_THRESHOLDS } from "@/constants";
import type { CrowdZone, Gate, DensityLevel, MatchScheduleEntry } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Classifies a percentage value into a density level using shared thresholds.
 */
function classifyDensity(pct: number): DensityLevel {
  if (pct >= DENSITY_THRESHOLDS.critical) return "critical";
  if (pct >= DENSITY_THRESHOLDS.high) return "high";
  if (pct >= DENSITY_THRESHOLDS.medium) return "medium";
  return "low";
}

/**
 * Classifies a wait time in minutes into a density level using shared thresholds.
 */
function classifyWaitStatus(waitMinutes: number): DensityLevel {
  if (waitMinutes >= WAIT_THRESHOLDS.critical) return "critical";
  if (waitMinutes >= WAIT_THRESHOLDS.high) return "high";
  if (waitMinutes >= WAIT_THRESHOLDS.medium) return "medium";
  return "low";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    const { venueId } = await params;
    const venue = getVenue(venueId);
    if (!venue) {
      return NextResponse.json({ error: `Venue '${venueId}' not found.` }, { status: 404 });
    }

    const ops = getOperations();
    const analytics = getAnalytics();
    const schedule = getMatchSchedule();

    // Simulate crowd zone density drift (-3 to +3 percentage points)
    const crowdZonesLive: CrowdZone[] = venue.crowd_zones.map((z) => {
      const drift = Math.floor(Math.random() * 7) - 3;
      const pct = Math.max(0, Math.min(100, z.density_pct + drift));
      return {
        ...z,
        density_pct: pct,
        density: classifyDensity(pct),
      };
    });

    // Simulate gate wait time drift (-2 to +4 minutes)
    const gatesLive: Gate[] = venue.gates.map((g) => {
      const drift = Math.floor(Math.random() * 7) - 2;
      const wait = Math.max(0, g.wait_minutes + drift);
      return {
        ...g,
        wait_minutes: wait,
        wait_status: classifyWaitStatus(wait),
      };
    });

    const venueSchedule = schedule.filter(
      (m: MatchScheduleEntry) => m.venue_id === venue.id
    );

    return NextResponse.json({
      venue_name: venue.name,
      city: venue.city,
      capacity: venue.capacity,
      total_fans_today: analytics.total_fans_today || 0,
      avg_satisfaction_score: analytics.avg_satisfaction_score || 4.2,
      crowd_zones: crowdZonesLive,
      gates: gatesLive,
      staff_alerts: ops.staff_alerts || [],
      match_schedule: venueSchedule,
      analytics: analytics,
      shuttle_status: venue.transport.shuttle_routes,
      parking_summary: venue.transport.parking_lots,
      volunteer_posts: ops.volunteer_posts || [],
      medical_points: ops.medical_points || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
