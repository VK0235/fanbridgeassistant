import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, containsInjectionAttempt, sanitizeForPrompt } from "@/lib/security";
import { classifyIntent } from "@/lib/intent";
import { getReply } from "@/lib/llmService";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";

    const rateLimitOk = checkRateLimit(ip, 20, 60);
    if (!rateLimitOk) {
      return NextResponse.json({ error: "Rate limit exceeded. Please slow down." }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const { venue_id } = body;
    let { message, language, history, user_mode } = body;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty or whitespace only." }, { status: 400 });
    }
    message = sanitizeForPrompt(message);
    if (message.length > 800) {
      return NextResponse.json({ error: "Message is too long (maximum 800 characters)." }, { status: 400 });
    }

    language = typeof language === "string" && language.trim() ? language.trim() : "English";

    if (!Array.isArray(history)) {
      history = [];
    } else if (history.length > 10) {
      history = history.slice(-10);
    }

    const validModes = ["fan", "staff", "volunteer", "organizer"];
    user_mode = validModes.includes(user_mode) ? user_mode : "fan";

    if (containsInjectionAttempt(message)) {
      return NextResponse.json({
        reply: "⚽ I can only help with stadium navigation, crowd status, accessibility, transport, sustainability, or emergencies. Could you rephrase your question?",
        detected_intent: "blocked",
        venue_id: venue_id || null,
        cached: false,
      });
    }

    const intent = classifyIntent(message);

    const { reply, cached } = await getReply(message, language, intent, history, venue_id, user_mode);

    return NextResponse.json({
      reply,
      detected_intent: intent,
      cached,
      venue_id: venue_id || null,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    if (error.message && error.message.includes("LLM not configured")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Assistant is temporarily unavailable." }, { status: 502 });
  }
}
