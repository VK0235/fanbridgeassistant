import fs from "fs";
import path from "path";

let cachedContext: any = null;

export function loadStadiumContext() {
  if (cachedContext) return cachedContext;
  const filePath = path.join(process.cwd(), "data", "stadium_context.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  cachedContext = JSON.parse(fileContent);
  return cachedContext;
}

export function getAllVenues() {
  return loadStadiumContext().venues;
}

export function getVenue(venueId?: string) {
  const ctx = loadStadiumContext();
  const target = venueId || ctx.default_venue || "metlife";
  const venue = ctx.venues.find((v: any) => v.id === target);
  return venue || ctx.venues[0];
}

export function getOperations() {
  return loadStadiumContext().operations;
}

export function getAnalytics() {
  return loadStadiumContext().analytics || {};
}

export function getMatchSchedule() {
  return loadStadiumContext().match_schedule || [];
}

export function invalidateCache() {
  cachedContext = null;
}
