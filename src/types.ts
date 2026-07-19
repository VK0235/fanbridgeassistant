// =============================================================================
// FanBridge AI — Centralized Type Definitions
// =============================================================================

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** Density levels used across crowd zones and gate wait statuses. */
export type DensityLevel = "critical" | "high" | "medium" | "low";

/** Severity levels for operational alerts. */
export type Severity = "high" | "medium" | "low";

/** User persona modes controlling UI view and AI prompt selection. */
export type UserMode = "fan" | "volunteer" | "staff" | "organizer";

/** Mobile tab selection for responsive layout. */
export type MobileTab = "dashboard" | "chat";

/** Chat message role indicator. */
export type MessageRole = "user" | "assistant";

// ---------------------------------------------------------------------------
// Venue Data Model (mirrors stadium_context.json)
// ---------------------------------------------------------------------------

export interface GateCoordinates {
  x: number;
  y: number;
}

export interface Gate {
  id: string;
  zone: string;
  type: string;
  accessible: boolean;
  wait_status: DensityLevel;
  wait_minutes: number;
  coordinates: GateCoordinates;
}

export interface CrowdZone {
  zone: string;
  density: DensityLevel;
  density_pct: number;
  recommendation: string;
}

export interface VenueAccessibility {
  wheelchair_entries: string[];
  sensory_room: string;
  accessible_parking: string;
  companion_seating: string;
  elevator_locations: string[];
  audio_description: string;
  braille_maps: string;
}

export interface ShuttleRoute {
  route: string;
  from: string;
  frequency_min: number;
  status: string;
  capacity_pct: number;
}

export interface ParkingLot {
  name: string;
  status: "full" | "available";
  spaces: number;
  total: number;
}

export interface VenueTransport {
  shuttle_routes: ShuttleRoute[];
  parking_lots: ParkingLot[];
  rideshare_zone: string;
  NJ_transit_line: string;
}

export interface VenueSustainability {
  recycling_points: string[];
  water_refill_stations: number;
  solar_panels: string;
  carbon_tip: string;
  waste_diversion_target: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  final_host: boolean;
  gates: Gate[];
  crowd_zones: CrowdZone[];
  accessibility: VenueAccessibility;
  transport: VenueTransport;
  sustainability: VenueSustainability;
}

/** Subset of Venue used for the venue selector dropdown. */
export interface VenueSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
}

// ---------------------------------------------------------------------------
// Operations & Analytics
// ---------------------------------------------------------------------------

export interface MedicalPoint {
  location: string;
  staffed: boolean;
  type: string;
}

export interface VolunteerPost {
  id: string;
  zone: string;
  role: string;
  headcount: number;
}

export interface StaffAlert {
  id: string;
  severity: Severity;
  zone: string;
  message: string;
  timestamp: string;
}

export interface PublicEmergencyNumbers {
  [country: string]: string;
}

export interface Operations {
  medical_points: MedicalPoint[];
  security_contact: string;
  lost_and_found: string;
  lost_child_protocol: string;
  emergency_note: string;
  volunteer_posts: VolunteerPost[];
  staff_alerts: StaffAlert[];
  aed_locations: string[];
  public_emergency_numbers: PublicEmergencyNumbers;
}

export interface LanguageUsage {
  [language: string]: number;
}

export interface Analytics {
  total_fans_today: number;
  avg_satisfaction_score: number;
  queries_handled: number;
  top_questions: string[];
  languages_used: LanguageUsage;
}

export interface MatchScheduleEntry {
  match_id: string;
  date: string;
  time: string;
  home: string;
  away: string;
  venue_id: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Top-Level Stadium Context (the full JSON shape)
// ---------------------------------------------------------------------------

export interface StadiumContext {
  venues: Venue[];
  default_venue: string;
  supported_languages: string[];
  operations: Operations;
  match_schedule: MatchScheduleEntry[];
  analytics: Analytics;
}

// ---------------------------------------------------------------------------
// Dashboard API Response
// ---------------------------------------------------------------------------

export interface DashboardResponse {
  venue_name: string;
  city: string;
  capacity: number;
  total_fans_today: number;
  avg_satisfaction_score: number;
  crowd_zones: CrowdZone[];
  gates: Gate[];
  staff_alerts: StaffAlert[];
  match_schedule: MatchScheduleEntry[];
  analytics: Analytics;
  shuttle_status: ShuttleRoute[];
  parking_summary: ParkingLot[];
  volunteer_posts: VolunteerPost[];
  medical_points: MedicalPoint[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Chat Types
// ---------------------------------------------------------------------------

export interface Message {
  role: MessageRole;
  content: string;
  intent?: string;
  cached?: boolean;
}

export interface ChatRequest {
  message: string;
  language: string;
  history: { role: MessageRole; content: string }[];
  venue_id: string;
  user_mode: UserMode;
}

export interface ChatResponse {
  reply: string;
  detected_intent: string;
  cached: boolean;
  venue_id: string | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// LLM Service Types
// ---------------------------------------------------------------------------

export interface HistoryTurn {
  role: MessageRole;
  content: string;
}

export interface LLMReplyResult {
  reply: string;
  cached: boolean;
}
