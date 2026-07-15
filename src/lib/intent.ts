import { getVenue, getOperations, loadStadiumContext } from "./dataStore";

export const INTENT_KEYWORDS: Record<string, string[]> = {
  emergency: [
    "emergency", "medical", "hurt", "injured", "collapsed", "lost child",
    "missing child", "security concern", "unsafe", "help urgent",
    "ambulance", "heart attack", "fainted", "bleeding", "fire",
    "evacuation", "aed", "defibrillator", "lost kid",
  ],
  navigation: [
    "gate", "entry", "where is", "route", "how do i get", "map", "seat",
    "section", "find", "directions", "location", "how to reach", "stand",
    "concourse", "level", "stairs", "elevator", "ramp", "kiosk",
  ],
  crowd: [
    "crowd", "busy", "congestion", "queue", "wait", "line", "packed",
    "full", "overflow", "density", "traffic", "bottleneck", "rush",
    "avoid", "alternative route", "less crowded",
  ],
  accessibility: [
    "wheelchair", "accessible", "disability", "sensory", "companion seat",
    "assistance", "deaf", "blind", "mobility", "lift", "elevator",
    "braille", "hearing loop", "audio description", "carer",
  ],
  transport: [
    "shuttle", "parking", "bus", "rideshare", "uber", "lyft", "taxi",
    "how do i reach", "metro", "train", "transit", "car", "arrive",
    "getting here", "directions from", "airport", "station",
  ],
  sustainability: [
    "recycle", "recycling", "water refill", "carbon", "sustainable", "eco",
    "environment", "green", "waste", "compost", "emissions", "solar",
    "reusable", "plastic free",
  ],
  staff_ops: [
    "volunteer", "staff", "organizer", "operations", "deploy", "post",
    "incident", "alert", "dashboard", "report", "headcount", "shift",
    "briefing", "command", "zone status", "venue ops",
  ],
  multilingual: [
    "translate", "translation", "language", "speak", "spanish", "french",
    "portuguese", "hindi", "arabic", "japanese", "how do you say",
  ],
};

export const INTENT_ORDER = [
  "emergency", "navigation", "crowd", "accessibility",
  "transport", "sustainability", "staff_ops", "multilingual",
];

export function classifyIntent(message: string): string {
  const lowered = message.toLowerCase();
  for (const intent of INTENT_ORDER) {
    if (INTENT_KEYWORDS[intent].some((kw) => lowered.includes(kw))) {
      return intent;
    }
  }
  return "general";
}

export function buildContextSnippet(intent: string, venueId?: string): string {
  const venue = getVenue(venueId);
  const ops = getOperations();
  const ctx = loadStadiumContext();

  const mapping: Record<string, any> = {
    navigation: {
      venue_name: venue.name,
      city: venue.city,
      gates: venue.gates,
      note: "Guide the fan to the correct gate using wait_status and wait_minutes.",
    },
    crowd: {
      venue_name: venue.name,
      crowd_zones: venue.crowd_zones,
      note: "Use density_pct and recommendation to advise the best route.",
    },
    accessibility: {
      venue_name: venue.name,
      accessibility: venue.accessibility,
      gates: venue.gates.filter((g: any) => g.accessible),
      note: "Wheelchair, sensory, companion seating — be specific and empathetic.",
    },
    transport: {
      venue_name: venue.name,
      transport: venue.transport,
      note: "Include wait/delay status and recommend the greenest option where possible.",
    },
    sustainability: {
      venue_name: venue.name,
      sustainability: venue.sustainability,
      note: "Highlight recycling locations and the carbon-reduction tip.",
    },
    emergency: {
      operations: ops,
      venue_name: venue.name,
      aed_locations: ops.aed_locations || [],
      note: "PRIORITY: Give calm, clear, ACTIONABLE safety guidance above all else. Use numbered steps.",
    },
    staff_ops: {
      venue_name: venue.name,
      volunteer_posts: ops.volunteer_posts || [],
      staff_alerts: ops.staff_alerts || [],
      crowd_zones: venue.crowd_zones,
      gates: venue.gates,
      note: "Provide operational intelligence — zone status, alert summaries, staffing recommendations.",
    },
    multilingual: {
      venue_name: venue.name,
      supported_languages: ctx.supported_languages || [],
      note: "Help the fan understand available language support and answer their underlying question.",
    },
  };

  const payload = mapping[intent] || {
    venue_name: venue.name,
    gates: venue.gates.slice(0, 2),
    note: "General fan query — answer helpfully and suggest asking about navigation, crowd, transport, or accessibility.",
  };

  return JSON.stringify(payload);
}
