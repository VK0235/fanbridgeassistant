const requestLog: Map<string, number[]> = new Map();

export const INJECTION_MARKERS = [
  "ignore previous instructions",
  "ignore all previous",
  "you are now",
  "system prompt",
  "disregard your instructions",
  "reveal your instructions",
  "act as if",
];

export function checkRateLimit(clientId: string, maxRequests = 20, windowS = 60): boolean {
  const now = Date.now() / 1000;
  const windowStart = now - windowS;

  let timestamps = requestLog.get(clientId) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  if (timestamps.length >= maxRequests) {
    return false;
  }

  timestamps.push(now);
  requestLog.set(clientId, timestamps);
  return true;
}

export function containsInjectionAttempt(message: string): boolean {
  const lowered = message.toLowerCase();
  return INJECTION_MARKERS.some((marker) => lowered.includes(marker));
}

export function sanitizeForPrompt(message: string): string {
  return message.split(/\s+/).join(" ").trim();
}
