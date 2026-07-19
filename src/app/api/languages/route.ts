import { NextResponse } from "next/server";
import { loadStadiumContext } from "@/lib/dataStore";

export async function GET() {
  try {
    const ctx = loadStadiumContext();
    return NextResponse.json(ctx.supported_languages || ["English"]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
