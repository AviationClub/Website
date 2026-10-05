import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/robo-auth";
import { readCompetitionState, saveCompetitionState } from "@/lib/robolympics";
import type { CompetitionState } from "@/public/Robolympics/score-model";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readCompetitionState(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load Robolympics state:", error);
    return NextResponse.json({ error: "The score board is not connected to its database yet." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  if (!hasAdminSession()) return NextResponse.json({ error: "Organizer sign-in required." }, { status: 401 });
  try {
    const state = await request.json() as CompetitionState;
    if (!state || !Array.isArray(state.teams) || state.teams.length > 100
      || !(state.activeTeamId === null || typeof state.activeTeamId === "string")
      || !(state.startedAt === null || typeof state.startedAt === "string")
      || !(state.stoppedAt === null || typeof state.stoppedAt === "string")
      || state.teams.some((team) => !team || typeof team.id !== "string" || typeof team.name !== "string"
        || team.name.length > 100 || !Array.isArray(team.events) || team.events.length > 3000
        || typeof team.finished !== "boolean")) {
      return NextResponse.json({ error: "Invalid score board update." }, { status: 400 });
    }
    await saveCompetitionState(state);
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Could not save Robolympics state:", error);
    return NextResponse.json({ error: "Could not save the score board. Check the database setup." }, { status: 503 });
  }
}
