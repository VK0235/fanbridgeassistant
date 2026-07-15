import { NextResponse } from "next/server";
import { loadStadiumContext } from "@/lib/dataStore";

export async function GET() {
  try {
    const ctx = loadStadiumContext();
    return NextResponse.json(ctx.supported_languages || ["English"]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
