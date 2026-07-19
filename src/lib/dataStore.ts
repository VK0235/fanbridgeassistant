import fs from "fs";
import path from "path";
import type { StadiumContext, Venue, Operations, Analytics, MatchScheduleEntry } from "../types";
import { DEFAULT_VENUE_ID } from "../constants";

const filePath = path.join(process.cwd(), "data", "stadium_context.json");

// Read and parse JSON database once at module initialization to prevent runtime event-loop blocking
let cachedContext: StadiumContext = JSON.parse(fs.readFileSync(filePath, "utf-8")) as StadiumContext;

/**
 * Loads and caches the stadium context JSON database.
 */
export function loadStadiumContext(): StadiumContext {
  return cachedContext;
}

/** Returns the full list of venues from the stadium context. */
export function getAllVenues(): Venue[] {
  return loadStadiumContext().venues;
}

/**
 * Finds and returns a specific venue by ID.
 * Falls back to the default venue, then to the first venue in the list.
 */
export function getVenue(venueId?: string): Venue {
  const ctx = loadStadiumContext();
  const target = venueId || ctx.default_venue || DEFAULT_VENUE_ID;
  const venue = ctx.venues.find((v) => v.id === target);
  return venue || ctx.venues[0];
}

/** Returns the global operations data (medical points, alerts, volunteer posts). */
export function getOperations(): Operations {
  return loadStadiumContext().operations;
}

/** Returns the global analytics data. */
export function getAnalytics(): Analytics {
  return loadStadiumContext().analytics;
}

/** Returns the match schedule array. */
export function getMatchSchedule(): MatchScheduleEntry[] {
  return loadStadiumContext().match_schedule;
}

/** Invalidates the in-memory cache, forcing a re-read on next access. */
export function invalidateCache(): void {
  cachedContext = JSON.parse(fs.readFileSync(filePath, "utf-8")) as StadiumContext;
}
