import { createClient } from "@supabase/supabase-js";
import { emptyCompetitionState, type CompetitionState } from "../public/Robolympics/score-model";
export { emptyCompetitionState } from "../public/Robolympics/score-model";
export type { CompetitionState, CompetitionTeam, ScoreEvent, ScoreKey } from "../public/Robolympics/score-model";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function readCompetitionState(): Promise<{ state: CompetitionState; revision: string }> {
  const { data, error } = await getSupabaseAdmin()
    .from("robolympics_state")
    .select("state, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { state: emptyCompetitionState, revision: "missing" };
  return {
    state: data.state && typeof data.state === "object" ? data.state as CompetitionState : emptyCompetitionState,
    revision: data.updated_at,
  };
}

export async function saveCompetitionState(state: CompetitionState, expectedRevision: string): Promise<string | null> {
  const expectedTime = Date.parse(expectedRevision);
  if (!Number.isFinite(expectedTime)) throw new Error("Missing or invalid database revision. Reload the organizer page.");
  const nextTimestamp = new Date(Math.max(Date.now(), expectedTime + 1)).toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("robolympics_state")
    .update({ state, updated_at: nextTimestamp })
    .eq("id", 1)
    .eq("updated_at", expectedRevision)
    .select("state, updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (stableJson(data.state) !== stableJson(state)) {
    throw new Error("The saved Robolympics state did not match the requested update.");
  }
  return data.updated_at;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
