import { createClient } from "@supabase/supabase-js";
import { emptyCompetitionState, type CompetitionState } from "../public/Robolympics/score-model";
export { emptyCompetitionState } from "../public/Robolympics/score-model";
export type { CompetitionState, CompetitionTeam, ScoreEvent, ScoreKey, TrackTwoGameResult, TrackTwoMatch, TrackTwoRound, TrackTwoState } from "../public/Robolympics/score-model";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  // Prefer Supabase's current server-only secret key; retain the legacy key as a migration fallback.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server configuration is missing.");
  // Next.js may cache server-side fetches. Scoreboard state must always come from the live row.
  const uncachedFetch: typeof fetch = (input, init) => fetch(input, { ...init, cache: "no-store" });
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: uncachedFetch },
  });
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

export async function saveCompetitionState(
  baseState: CompetitionState,
  requestedState: CompetitionState,
  expectedRevision: string,
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  let candidate = requestedState;
  let revision = expectedRevision;

  // Rebase changes made on another phone/tab instead of rejecting normal concurrent updates.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const expectedTime = Date.parse(revision);
    const nextTimestamp = new Date(Math.max(Date.now(), Number.isFinite(expectedTime) ? expectedTime + 1 : Date.now())).toISOString();
    const { data, error } = await supabase
      .from("robolympics_state")
      .update({ state: candidate, updated_at: nextTimestamp })
      .eq("id", 1)
      .eq("updated_at", revision)
      .select("state, updated_at")
      .maybeSingle();
    if (error) throw error;
    if (data) {
      if (stableJson(data.state) !== stableJson(candidate)) {
        throw new Error("The saved Robolympics state did not match the requested update.");
      }
      return data.updated_at;
    }

    const latest = await readCompetitionState();
    if (latest.revision === "missing") return null;
    candidate = mergeCompetitionState(baseState, requestedState, latest.state);
    revision = latest.revision;
  }
  return null;
}

function mergeCompetitionState(base: CompetitionState, requested: CompetitionState, latest: CompetitionState): CompetitionState {
  const baseTeams = new Map(base.teams.map((team) => [team.id, team]));
  const requestedTeams = new Map(requested.teams.map((team) => [team.id, team]));
  const latestTeams = new Map(latest.teams.map((team) => [team.id, team]));

  // Deletions in the user's change are applied only to teams in its base snapshot.
  for (const id of baseTeams.keys()) {
    if (!requestedTeams.has(id)) latestTeams.delete(id);
  }

  for (const [id, wanted] of requestedTeams) {
    const before = baseTeams.get(id);
    const current = latestTeams.get(id);
    if (!before || !current) {
      if (!current) latestTeams.set(id, wanted);
      continue;
    }

    const wantedEventIds = new Set(wanted.events.map((entry) => entry.id));
    const removedEventIds = new Set(before.events.filter((entry) => !wantedEventIds.has(entry.id)).map((entry) => entry.id));
    const mergedEvents = new Map(current.events.filter((entry) => !removedEventIds.has(entry.id)).map((entry) => [entry.id, entry]));
    const beforeEventIds = new Set(before.events.map((entry) => entry.id));
    for (const entry of wanted.events) {
      if (!beforeEventIds.has(entry.id)) mergedEvents.set(entry.id, entry);
    }

    latestTeams.set(id, {
      ...current,
      name: wanted.name !== before.name ? wanted.name : current.name,
      events: [...mergedEvents.values()],
      finished: wanted.finished !== before.finished ? wanted.finished : current.finished,
    });
  }

  const teams = [...latestTeams.values()];
  const activeTeamId = requested.activeTeamId !== base.activeTeamId ? requested.activeTeamId : latest.activeTeamId;
  const activeExists = activeTeamId === null || teams.some((team) => team.id === activeTeamId);
  const track2 = stableJson(requested.track2) !== stableJson(base.track2) ? requested.track2 : latest.track2;
  return {
    teams,
    activeTeamId: activeExists ? activeTeamId : null,
    startedAt: !activeExists ? null : requested.startedAt !== base.startedAt ? requested.startedAt : latest.startedAt,
    stoppedAt: !activeExists ? null : requested.stoppedAt !== base.stoppedAt ? requested.stoppedAt : latest.stoppedAt,
    ...(track2 ? { track2 } : {}),
  };
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
