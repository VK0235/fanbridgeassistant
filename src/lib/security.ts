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

// Helper for memory rate-limiting with strict limits & cleanup to prevent memory leaks
function checkRateLimitInMemory(clientId: string, maxRequests = 20, windowS = 60): boolean {
  const now = Date.now() / 1000;
  const windowStart = now - windowS;

  let timestamps = requestLog.get(clientId) || [];
  timestamps = timestamps.filter((t) => t > windowStart);

  // Run a complete sweep when Map gets large to prevent memory leak
  if (requestLog.size > 1000) {
    for (const [key, list] of requestLog.entries()) {
      const active = list.filter((t) => t > windowStart);
      if (active.length === 0) {
        requestLog.delete(key);
      } else if (active.length !== list.length) {
        requestLog.set(key, active);
      }
    }
  }

  // Strictly bound map memory capacity using Map iteration (oldest inserted key first)
  if (requestLog.size > 2000) {
    const oldestKey = requestLog.keys().next().value;
    if (oldestKey !== undefined) {
      requestLog.delete(oldestKey);
    }
  }

  if (timestamps.length >= maxRequests) {
    if (timestamps.length === 0) {
      requestLog.delete(clientId);
    } else {
      requestLog.set(clientId, timestamps);
    }
    return false;
  }

  timestamps.push(now);
  requestLog.set(clientId, timestamps);
  return true;
}

export async function checkRateLimit(clientId: string, maxRequests = 20, windowS = 60): Promise<boolean> {
  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const windowId = Math.floor(Date.now() / 1000 / windowS);
      const key = `rate_limit:${clientId}:${windowId}`;
      const baseUrl = UPSTASH_URL.endsWith("/") ? UPSTASH_URL : `${UPSTASH_URL}/`;

      const response = await fetch(`${baseUrl}pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowS * 2],
        ]),
      });

      if (!response.ok) {
        throw new Error(`Upstash Redis returned status ${response.status}`);
      }

      const data = await response.json();
      const count = data[0]?.result;

      if (typeof count === "number" && count > maxRequests) {
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Distributed rate limit check via Upstash failed. Falling back to memory rate limiting:", error);
    }
  }

  return checkRateLimitInMemory(clientId, maxRequests, windowS);
}

export function containsInjectionAttempt(message: string): boolean {
  const lowered = message.toLowerCase();
  return INJECTION_MARKERS.some((marker) => lowered.includes(marker));
}

export function sanitizeForPrompt(message: string): string {
  return message.split(/\s+/).join(" ").trim();
}
