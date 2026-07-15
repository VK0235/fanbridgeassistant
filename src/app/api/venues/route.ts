import { NextResponse } from "next/server";
import { getAllVenues } from "@/lib/dataStore";

export async function GET() {
  try {
    const venues = getAllVenues();
    const summary = venues.map((v: any) => ({
      id: v.id,
      name: v.name,
      city: v.city,
      country: v.country,
      capacity: v.capacity,
    }));
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
