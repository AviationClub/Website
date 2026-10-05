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
    const body = await request.json() as { baseState?: CompetitionState; state?: CompetitionState; expectedRevision?: string };
    const baseState = body?.baseState;
    const state = body?.state;
    const validState = (value: CompetitionState | undefined) => Boolean(value && Array.isArray(value.teams) && value.teams.length <= 100
      && (value.activeTeamId === null || typeof value.activeTeamId === "string")
      && (value.startedAt === null || typeof value.startedAt === "string")
      && (value.stoppedAt === null || typeof value.stoppedAt === "string")
      && !value.teams.some((team) => !team || typeof team.id !== "string" || typeof team.name !== "string"
        || team.name.length > 100 || !Array.isArray(team.events) || team.events.length > 3000
        || typeof team.finished !== "boolean"));
    if (!validState(baseState) || !validState(state)
      || typeof body.expectedRevision !== "string"
    ) {
      return NextResponse.json({ error: "Invalid score board update." }, { status: 400 });
    }
    const revision = await saveCompetitionState(baseState!, state!, body.expectedRevision);
    if (!revision) {
      return NextResponse.json({ error: "Several organizer updates arrived together. The latest data was kept; wait for the board to refresh, then try again." }, { status: 409 });
    }
    return NextResponse.json({ saved: true, revision });
  } catch (error) {
    console.error("Could not save Robolympics state:", error);
    const message = error instanceof Error ? error.message : "Could not save the score board.";
    return NextResponse.json({ error: `Save failed: ${message}` }, { status: 503 });
  }
}
