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

export async function readCompetitionState(): Promise<CompetitionState> {
  const { data, error } = await getSupabaseAdmin()
    .from("robolympics_state")
    .select("state")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  if (!data?.state || typeof data.state !== "object") return emptyCompetitionState;
  return data.state as CompetitionState;
}

export async function saveCompetitionState(state: CompetitionState) {
  const { error } = await getSupabaseAdmin().from("robolympics_state").upsert({
    id: 1, state, updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
