// =============================================================================
// FanBridge AI — Shared Utility Functions
// =============================================================================

import type { DensityLevel, CrowdZone } from "../types";
import {
  ZONE_FILL_COLORS,
  ZONE_STROKE_COLORS,
  DENSITY_BADGE_CLASSES,
  WAIT_BADGE_CLASSES,
  SEVERITY_CLASSES,
  WAIT_PROGRESS_COLORS,
  MAX_WAIT_MINUTES_SCALE,
  SVG_GAUGE_RADIUS,
  ECO_PERCENTAGES,
  DEFAULT_ECO_PERCENTAGES,
} from "../constants";

// ---------------------------------------------------------------------------
// Status Color Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the SVG fill color for a given density level.
 * Falls back to a neutral color when the zone is unknown.
 */
export function getZoneFillColor(level: DensityLevel | undefined): string {
  return level ? (ZONE_FILL_COLORS[level] ?? ZONE_FILL_COLORS.default) : ZONE_FILL_COLORS.default;
}

/**
 * Returns the SVG stroke color for a given density level.
 */
export function getZoneStrokeColor(level: DensityLevel | undefined): string {
  return level ? (ZONE_STROKE_COLORS[level] ?? ZONE_STROKE_COLORS.default) : ZONE_STROKE_COLORS.default;
}

// ---------------------------------------------------------------------------
// Badge Class Helpers
// ---------------------------------------------------------------------------

/**
 * Returns Tailwind classes for a density badge.
 */
export function getDensityBadgeClasses(level: string): string {
  return DENSITY_BADGE_CLASSES[level.toLowerCase()] ?? DENSITY_BADGE_CLASSES.low;
}

/**
 * Returns Tailwind classes for a gate wait-status badge.
 */
export function getWaitBadgeClasses(status: string): string {
  return WAIT_BADGE_CLASSES[status.toLowerCase()] ?? WAIT_BADGE_CLASSES.low;
}

/**
 * Returns Tailwind classes for an alert severity indicator.
 */
export function getSeverityClasses(severity: string): string {
  return SEVERITY_CLASSES[severity.toLowerCase()] ?? SEVERITY_CLASSES.low;
}

/**
 * Returns the Tailwind background class for a wait-time progress bar.
 */
export function getWaitProgressColor(status: string): string {
  return WAIT_PROGRESS_COLORS[status.toLowerCase()] ?? WAIT_PROGRESS_COLORS.low;
}

// ---------------------------------------------------------------------------
// Progress / Gauge Calculations
// ---------------------------------------------------------------------------

/**
 * Calculates the CSS width percentage for a progress bar.
 * Clamps between 0–100%.
 */
export function calculateProgressWidth(current: number, max: number): string {
  return `${Math.min(100, Math.max(0, (current / max) * 100))}%`;
}

/**
 * Calculates the SVG `strokeDashoffset` for a circular gauge.
 */
export function calculateGaugeOffset(percentage: number, radius: number = SVG_GAUGE_RADIUS): number {
  const circumference = 2 * Math.PI * radius;
  return circumference * (1 - percentage / 100);
}

/**
 * Returns the full circumference for a gauge circle.
 */
export function getGaugeCircumference(radius: number = SVG_GAUGE_RADIUS): number {
  return 2 * Math.PI * radius;
}

/**
 * Calculates gate wait-time progress bar width using the standard scale.
 */
export function getGateProgressWidth(waitMinutes: number): string {
  return calculateProgressWidth(waitMinutes, MAX_WAIT_MINUTES_SCALE);
}

// ---------------------------------------------------------------------------
// Venue Helpers
// ---------------------------------------------------------------------------

/**
 * Returns eco (carbon/solar) percentages for a given venue ID.
 */
export function getEcoPercentages(venueId: string): { carbon: number; solar: number } {
  return ECO_PERCENTAGES[venueId] ?? DEFAULT_ECO_PERCENTAGES;
}

// ---------------------------------------------------------------------------
// Zone Matching — Multilingual Semantic Concourse Mapping
// ---------------------------------------------------------------------------

/** Keyword sets for mapping blueprint zone names to crowd zone data. */
const ZONE_KEYWORD_MAP: Record<string, string[]> = {
  North: ["north", "norte", "explanada n"],
  South: ["south", "sur"],
  East: ["east", "oriente", "corredor o"],
  West: ["west", "poniente", "plaza p"],
  "Level 2": ["level 2", "pasillo", "central"],
  "Upper Bowl": ["upper", "rampa", "bridge", "tunnel"],
};

/**
 * Finds a crowd zone matching a blueprint zone name using multilingual keywords.
 */
export function findZoneByBlueprintName(
  blueprintName: string,
  crowdZones: CrowdZone[] | undefined
): CrowdZone | undefined {
  if (!crowdZones) return undefined;
  const keywords = ZONE_KEYWORD_MAP[blueprintName];
  if (!keywords) return undefined;

  return crowdZones.find((z) => {
    const name = z.zone.toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
}
