import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, containsInjectionAttempt, sanitizeForPrompt } from "@/lib/security";
import { classifyIntent } from "@/lib/intent";
import { getReply } from "@/lib/llmService";
import {
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_SECONDS,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_LENGTH,
  USER_MODES,
} from "@/constants";
import type { HistoryTurn, UserMode } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip, RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { venue_id } = body;
    let { message, language, history, user_mode } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty or whitespace only." },
        { status: 400 }
      );
    }

    message = sanitizeForPrompt(message);
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message is too long (maximum ${MAX_MESSAGE_LENGTH} characters).` },
        { status: 400 }
      );
    }

    language =
      typeof language === "string" && language.trim() ? language.trim() : "English";

    if (!Array.isArray(history)) {
      history = [];
    } else if (history.length > MAX_HISTORY_LENGTH) {
      history = history.slice(-MAX_HISTORY_LENGTH);
    }

    user_mode = USER_MODES.includes(user_mode) ? user_mode : "fan";

    if (containsInjectionAttempt(message)) {
      return NextResponse.json({
        reply:
          "I can only help with stadium navigation, crowd status, accessibility, transport, sustainability, or emergencies. Could you rephrase your question?",
        detected_intent: "blocked",
        venue_id: venue_id || null,
        cached: false,
      });
    }

    const intent = classifyIntent(message);
    const { reply, cached } = await getReply(
      message,
      language,
      intent,
      history as HistoryTurn[],
      venue_id,
      user_mode as UserMode
    );

    return NextResponse.json({
      reply,
      detected_intent: intent,
      cached,
      venue_id: venue_id || null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/chat:", errorMessage);

    if (errorMessage.includes("LLM not configured")) {
      return NextResponse.json({ error: errorMessage }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Assistant is temporarily unavailable." },
      { status: 502 }
    );
  }
}
