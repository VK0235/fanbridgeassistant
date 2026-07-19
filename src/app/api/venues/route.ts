import { NextResponse } from "next/server";
import { getAllVenues } from "@/lib/dataStore";
import type { VenueSummary, Venue } from "@/types";

export async function GET() {
  try {
    const venues = getAllVenues();
    const summary: VenueSummary[] = venues.map((v: Venue) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      country: v.country,
      capacity: v.capacity,
    }));
    return NextResponse.json(summary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
