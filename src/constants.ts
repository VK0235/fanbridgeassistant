// =============================================================================
// FanBridge AI — Centralized Constants
// =============================================================================

import type { UserMode } from "./types";

// ---------------------------------------------------------------------------
// Language → BCP-47 Locale Mapping (used by TTS and STT)
// ---------------------------------------------------------------------------

export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  English: "en-US",
  Spanish: "es-MX",
  French: "fr-FR",
  Portuguese: "pt-BR",
  German: "de-DE",
  Italian: "it-IT",
  Telugu: "te-IN",
  Hindi: "hi-IN",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  "Mandarin Chinese": "zh-CN",
  Russian: "ru-RU",
  Turkish: "tr-TR",
} as const;

// ---------------------------------------------------------------------------
// Polling & Timing
// ---------------------------------------------------------------------------

/** Dashboard telemetry refresh interval in milliseconds. */
export const DASHBOARD_POLL_INTERVAL_MS = 8_000;

/** How long speech-error banners display before auto-clearing (ms). */
export const SPEECH_ERROR_TIMEOUT_MS = 3_000;

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/** Maximum character length for chat messages. */
export const MAX_MESSAGE_LENGTH = 800;

/** Maximum chat history turns sent to the API. */
export const MAX_HISTORY_LENGTH = 10;

// ---------------------------------------------------------------------------
// Dashboard Thresholds (shared between client display & server simulation)
// ---------------------------------------------------------------------------

/** Crowd density percentage thresholds → DensityLevel. */
export const DENSITY_THRESHOLDS = {
  critical: 90,
  high: 70,
  medium: 40,
} as const;

/** Gate wait-time (minutes) thresholds → DensityLevel. */
export const WAIT_THRESHOLDS = {
  critical: 30,
  high: 20,
  medium: 8,
} as const;

/** Denominator for gate wait-time progress bar percentage. */
export const MAX_WAIT_MINUTES_SCALE = 35;

// ---------------------------------------------------------------------------
// SVG Gauge Constants
// ---------------------------------------------------------------------------

/** Radius used for the circular eco-gauge SVGs. */
export const SVG_GAUGE_RADIUS = 18;

/** SVG viewBox center for the gauge (cx/cy). */
export const SVG_GAUGE_CENTER = 22;

// ---------------------------------------------------------------------------
// Per-Venue Eco / Sustainability Percentages
// ---------------------------------------------------------------------------

export const ECO_PERCENTAGES: Record<string, { carbon: number; solar: number }> = {
  metlife: { carbon: 85, solar: 40 },
  sofi: { carbon: 90, solar: 25 },
  azteca: { carbon: 80, solar: 30 },
} as const;

/** Fallback eco percentages for unknown venues. */
export const DEFAULT_ECO_PERCENTAGES = { carbon: 80, solar: 30 } as const;

export const DEFAULT_VENUE_ID = "metlife";

// ---------------------------------------------------------------------------
// User Persona Configuration
// ---------------------------------------------------------------------------

export const USER_MODES = ["fan", "volunteer", "staff", "organizer"] as const;

export const PERSONA_LABELS: Record<UserMode, string> = {
  fan: "Fan Assistant",
  volunteer: "Volunteer Hub",
  staff: "Venue Staff Console",
  organizer: "Organizer Analytics",
} as const;

// ---------------------------------------------------------------------------
// Welcome Messages (per persona)
// ---------------------------------------------------------------------------

export const WELCOME_MESSAGES: Record<UserMode, string> = {
  fan: "Welcome to FIFA World Cup 2026! I'm your FanBridge AI companion. How can I help you find your seat, check gate wait times, or locate accessible transit today?",
  volunteer:
    "FanBridge Volunteer Hub active. Use this console to monitor zone densities, guide crowd flows, and coordinate with venue operations. Ask me about volunteer post deployments or active staff alerts.",
  staff:
    "FanBridge OpsAI interface loaded. Monitoring real-time stadium metrics. Recommending staffing actions for congested areas. Ask me about specific zone status or incident protocols.",
  organizer:
    "FanBridge Command Center online. Aggregate venue analytics and alert logs active. Recommending macro event adjustments. How can I support event coordination?",
} as const;

// ---------------------------------------------------------------------------
// Quick Suggestion Phrases (per persona)
// ---------------------------------------------------------------------------

export const QUICK_SUGGESTIONS: Record<UserMode, string[]> = {
  fan: [
    "Which gate is fastest?",
    "Wheelchair routing details",
    "Green transport routes",
    "sensory room locations",
  ],
  volunteer: [
    "Check volunteer posts",
    "List medical points",
    "Emergency gate procedures",
  ],
  staff: [
    "Deploy flow managers",
    "Read emergency protocol",
    "Gate B capacity issue",
  ],
  organizer: [
    "Deploy flow managers",
    "Read emergency protocol",
    "Gate B capacity issue",
  ],
} as const;

// ---------------------------------------------------------------------------
// Rate Limiting Defaults
// ---------------------------------------------------------------------------

export const RATE_LIMIT_MAX_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_SECONDS = 60;

// ---------------------------------------------------------------------------
// LLM Configuration Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_LLM_MODEL = "llama-3.1-8b-instant";
export const DEFAULT_LLM_TEMPERATURE = 0.4;
export const DEFAULT_LLM_MAX_TOKENS = 300;
export const DEFAULT_CACHE_TTL_SECONDS = 30;
export const MAX_LLM_HISTORY_TURNS = 6;

// ---------------------------------------------------------------------------
// Color Mappings for Status Levels
// ---------------------------------------------------------------------------

/** Zone fill colors keyed by density level (RGBA for SVG). */
export const ZONE_FILL_COLORS: Record<string, string> = {
  critical: "rgba(239, 68, 68, 0.3)",
  high: "rgba(249, 115, 22, 0.25)",
  medium: "rgba(245, 158, 11, 0.2)",
  low: "rgba(16, 185, 129, 0.15)",
  default: "rgba(203, 213, 225, 0.25)",
} as const;

/** Zone stroke colors keyed by density level (hex for SVG). */
export const ZONE_STROKE_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
  default: "#cbd5e1",
} as const;

/** Tailwind class strings for density badges. */
export const DENSITY_BADGE_CLASSES: Record<string, string> = {
  critical:
    "bg-red-50 text-red-700 border border-red-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase",
  high:
    "bg-orange-50 text-orange-700 border border-orange-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase",
  medium:
    "bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase",
  low:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase",
} as const;

/** Tailwind class strings for wait-status badges. */
export const WAIT_BADGE_CLASSES: Record<string, string> = {
  critical:
    "bg-red-50 text-red-700 border border-red-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold",
  high:
    "bg-orange-50 text-orange-700 border border-orange-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold",
  medium:
    "bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold",
  low:
    "bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-full px-2.5 py-0.5 text-[9px] font-bold",
} as const;

/** Tailwind class strings for alert severity. */
export const SEVERITY_CLASSES: Record<string, string> = {
  high: "bg-red-50 text-red-750 border border-red-200/60 animate-pulse",
  medium: "bg-amber-50 text-amber-750 border border-amber-200/60",
  low: "bg-blue-50 text-blue-755 border border-blue-100",
} as const;

/** Tailwind background classes for wait-time progress bars. */
export const WAIT_PROGRESS_COLORS: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
} as const;
