import { NextRequest, NextResponse } from "next/server";
import { getVenue, getOperations, getAnalytics, getMatchSchedule } from "@/lib/dataStore";

export const dynamic = "force-dynamic";


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

    // Simulate crowd zone density drift
    const crowdZonesLive = venue.crowd_zones.map((z: any) => {
      const drift = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const pct = Math.max(0, Math.min(100, z.density_pct + drift));
      let density = "low";
      if (pct >= 90) density = "critical";
      else if (pct >= 70) density = "high";
      else if (pct >= 40) density = "medium";
      return {
        ...z,
        density_pct: pct,
        density,
      };
    });

    // Simulate gate wait time drift
    const gatesLive = venue.gates.map((g: any) => {
      const drift = Math.floor(Math.random() * 7) - 2; // -2 to +4
      const wait = Math.max(0, g.wait_minutes + drift);
      let wait_status = "low";
      if (wait >= 30) wait_status = "critical";
      else if (wait >= 20) wait_status = "high";
      else if (wait >= 8) wait_status = "medium";
      return {
        ...g,
        wait_minutes: wait,
        wait_status,
      };
    });

    const venueSchedule = schedule.filter((m: any) => m.venue_id === venue.id);

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
