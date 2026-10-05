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
    const body = await request.json() as { state?: CompetitionState; expectedRevision?: string };
    const state = body?.state;
    if (!state || !Array.isArray(state.teams) || state.teams.length > 100
      || typeof body.expectedRevision !== "string"
      || !(state.activeTeamId === null || typeof state.activeTeamId === "string")
      || !(state.startedAt === null || typeof state.startedAt === "string")
      || !(state.stoppedAt === null || typeof state.stoppedAt === "string")
      || state.teams.some((team) => !team || typeof team.id !== "string" || typeof team.name !== "string"
        || team.name.length > 100 || !Array.isArray(team.events) || team.events.length > 3000
        || typeof team.finished !== "boolean")) {
      return NextResponse.json({ error: "Invalid score board update." }, { status: 400 });
    }
    const revision = await saveCompetitionState(state, body.expectedRevision);
    if (!revision) {
      return NextResponse.json({ error: "This page has an older score board version. The latest database data has been kept; refresh the page before making another change." }, { status: 409 });
    }
    return NextResponse.json({ saved: true, revision });
  } catch (error) {
    console.error("Could not save Robolympics state:", error);
    const message = error instanceof Error ? error.message : "Could not save the score board.";
    return NextResponse.json({ error: `Save failed: ${message}` }, { status: 503 });
  }
}
