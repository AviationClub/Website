export type ScoreKey = "zone1" | "zone2" | "zone3a" | "zone3b" | "detection" | "shot" | "escape" | "clean" | "speed" | "autonomy" | "penalty";
export type ScoreEvent = { id: string; key: ScoreKey; label: string; points: number; at: string };
export type CompetitionTeam = { id: string; name: string; events: ScoreEvent[]; finished: boolean };
export type CompetitionState = {
  teams: CompetitionTeam[];
  activeTeamId: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
};

export const emptyCompetitionState: CompetitionState = {
  teams: [], activeTeamId: null, startedAt: null, stoppedAt: null,
};

export const scoreLabels: Record<ScoreKey, string> = {
  zone1: "Stage 1 · Torque Ramp", zone2: "Stage 2 · Suspension Stairs",
  zone3a: "Stage 3.a · Rubble Area", zone3b: "Stage 3.b · Loose Stones",
  detection: "Stage 4.a · AI Token Detection", shot: "Stage 4.b · Precision Shot",
  escape: "Stage 5 · Escape the Facility", clean: "Stage 6 · Clean Run",
  speed: "Bonus · Speed Escape", autonomy: "Bonus · Autonomous Navigation",
  penalty: "Penalty · Topple / Hand-touch",
};

export function scoreFor(events: ScoreEvent[], key: ScoreKey) {
  return events.filter((event) => event.key === key).reduce((sum, event) => sum + event.points, 0);
}

export function totalFor(events: ScoreEvent[]) {
  return events.reduce((sum, event) => sum + event.points, 0);
}
