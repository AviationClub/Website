"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Activity, ArrowLeft, Check, CircleStop, Clock3, Flag, LogOut, Minus, Pencil, Plus, Radio, RotateCcw, Shield, Trash2, Trophy, Users } from "lucide-react";
import type { CompetitionState, CompetitionTeam, ScoreEvent, ScoreKey } from "./score-model";
import { emptyCompetitionState, scoreFor, scoreLabels, totalFor } from "./score-model";

const styles = new Proxy({} as Record<string, string>, {
  get: (_target, key) => typeof key === "string" ? key : "",
});

const MAX_RUN_SECONDS = 600;
const mainStages: { key: ScoreKey; points: number; short: string }[] = [
  { key: "zone1", points: 15, short: "Torque Ramp" },
  { key: "zone2", points: 15, short: "Suspension Stairs" },
  { key: "zone3a", points: 10, short: "Rubble Area" },
  { key: "zone3b", points: 10, short: "Loose Stones" },
  { key: "detection", points: 10, short: "Token Detection" },
  { key: "escape", points: 10, short: "Escape Facility" },
];
const mainStageNumbers = ["1", "2", "3.a", "3.b", "4.a", "5"];

function newId() { return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }
function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}
function event(key: ScoreKey, points: number, label = scoreLabels[key]): ScoreEvent {
  return { id: newId(), key, label, points, at: new Date().toISOString() };
}

function shotControls(team: CompetitionTeam, running: boolean, saving: boolean, record: (key: ScoreKey, points: number, label?: string) => void) {
  const attempts = team.events.filter((entry) => entry.key === "shot");
  const hit = attempts.some((entry) => entry.points > 0);
  const attemptNumber = attempts.length + 1;
  if (hit || attempts.length >= 3) return <div className={styles.controlHint}>{hit ? "Correct target hit. Shot scoring is complete." : "All three attempts recorded. Shot scoring is complete."}</div>;
  const points = [15, 10, 5][attemptNumber - 1];
  return <>
    <button className={styles.actionButton} disabled={!running || saving} onClick={() => record("shot", points, `Precision Shot · attempt ${attemptNumber} hit`)}><Check size={17} /><span><b>Hit · attempt {attemptNumber}</b><small>+{points} points</small></span></button>
    <button className={styles.actionButton} disabled={!running || saving} onClick={() => record("shot", 0, `Precision Shot · attempt ${attemptNumber} missed`)}><CircleStop size={17} /><span><b>Missed · attempt {attemptNumber}</b><small>0 points · next attempt available</small></span></button>
  </>;
}

function PastScoresEditor({ team, saving, onAdd, onRemove, onRemoveType, onDone }: {
  team: CompetitionTeam;
  saving: boolean;
  onAdd: (key: ScoreKey, points: number, label: string) => void;
  onRemove: (eventId: string) => void;
  onRemoveType: (key: ScoreKey) => void;
  onDone: () => void;
}) {
  const shotEvents = team.events.filter((entry) => entry.key === "shot");
  const usedAttempts = new Set(shotEvents.map((entry) => Number(entry.label.match(/attempt (\d+)/)?.[1])).filter(Number.isFinite));
  const nextAttempt = [1, 2, 3].find((attempt) => !usedAttempts.has(attempt));
  const speedEvents = team.events.filter((entry) => entry.key === "speed");
  const speedTotal = speedEvents.reduce((sum, entry) => sum + entry.points, 0);
  const autonomyZones = ["Torque Ramp", "Suspension Stairs", "Rubble Area", "Authentication Override"];
  const penalties = team.events.filter((entry) => entry.key === "penalty");

  return <section className={styles.scoreEditPanel}>
    <div className={styles.scoreEditHeading}>
      <div><small>EDIT COMPLETED RUN</small><b>{team.name}</b><span>Current total <strong>{totalFor(team.events)} pts</strong></span></div>
      <button className={styles.undoButton} onClick={onDone} disabled={saving}>Done</button>
    </div>

    <div className={styles.scoreEditGroup}>
      <div className={styles.scoreEditGroupHeading}><b>Stage results</b><small>Restore a missed result or remove a recorded one.</small></div>
      <div className={styles.scoreEditGrid}>
        {mainStages.map((stage, index) => {
          const entries = team.events.filter((entry) => entry.key === stage.key);
          const points = entries.reduce((sum, entry) => sum + entry.points, 0);
          return <article className={styles.scoreEditCard} key={stage.key}>
            <small>STAGE {mainStageNumbers[index]}</small>
            <b>{stage.short}</b>
            <span>{entries.length ? `${points >= 0 ? "+" : ""}${points} pts recorded` : `${stage.points} pts available`}</span>
            {entries.length
              ? <button className={styles.scoreRemoveButton} onClick={() => onRemoveType(stage.key)} disabled={saving}><Minus size={14} /> Remove stage points</button>
              : <button className={styles.scoreAwardButton} onClick={() => onAdd(stage.key, stage.points, scoreLabels[stage.key])} disabled={saving}><Plus size={14} /> Add +{stage.points} points</button>}
          </article>;
        })}
        {(() => {
          const entries = team.events.filter((entry) => entry.key === "clean");
          return <article className={styles.scoreEditCard}>
            <small>STAGE 6</small><b>Clean Run</b>
            <span>{entries.length ? `${entries.reduce((sum, entry) => sum + entry.points, 0)} pts recorded` : "15 pts available"}</span>
            {entries.length
              ? <button className={styles.scoreRemoveButton} onClick={() => onRemoveType("clean")} disabled={saving}><Minus size={14} /> Remove clean points</button>
              : <button className={styles.scoreAwardButton} onClick={() => onAdd("clean", 15, "Clean Run · +15 points")} disabled={saving}><Plus size={14} /> Add +15 points</button>}
          </article>;
        })()}
      </div>
    </div>

    <div className={styles.scoreEditGroup}>
      <div className={styles.scoreEditGroupHeading}><b>Precision shots</b><small>Record or remove individual attempts.</small></div>
      {shotEvents.map((entry) => <div className={styles.scoreEditEvent} key={entry.id}><span>{entry.label}</span><b>{entry.points >= 0 ? "+" : ""}{entry.points} pts</b><button className={styles.scoreRemoveButton} onClick={() => onRemove(entry.id)} disabled={saving} aria-label={`Remove ${entry.label}`}><Trash2 size={14} /> Remove</button></div>)}
      {nextAttempt ? <div className={styles.scoreEditChoices}><span>Add attempt {nextAttempt}</span><button className={styles.scoreAwardButton} onClick={() => onAdd("shot", [15, 10, 5][nextAttempt - 1], `Precision Shot · attempt ${nextAttempt} hit`)} disabled={saving}><Plus size={14} /> Hit · +{[15, 10, 5][nextAttempt - 1]}</button><button className={styles.scoreNeutralButton} onClick={() => onAdd("shot", 0, `Precision Shot · attempt ${nextAttempt} missed`)} disabled={saving}><Plus size={14} /> Miss · 0</button></div> : <p className={styles.scoreEditHint}>All three attempts have been recorded.</p>}
    </div>

    <div className={styles.scoreEditGroup}>
      <div className={styles.scoreEditGroupHeading}><b>Bonuses and penalties</b><small>Add missing awards or remove individual entries.</small></div>
      {speedEvents.map((entry) => <div className={styles.scoreEditEvent} key={entry.id}><span>{entry.label}</span><b>{entry.points >= 0 ? "+" : ""}{entry.points} pts</b><button className={styles.scoreRemoveButton} onClick={() => onRemove(entry.id)} disabled={saving}><Trash2 size={14} /> Remove</button></div>)}
      <div className={styles.scoreEditChoices}><span>Speed Escape · +2 per 30 seconds · {speedTotal}/40 pts</span>{[2, 4, 6, 8, 10].map((points) => <button className={styles.scoreAwardButton} key={points} onClick={() => onAdd("speed", points, `Speed Escape · +${points} points`)} disabled={saving || speedTotal + points > 40}><Plus size={14} /> Add +{points}</button>)}</div>
      {autonomyZones.map((zone) => {
        const label = `Autonomous navigation · ${zone}`;
        const entry = team.events.find((eventEntry) => eventEntry.key === "autonomy" && eventEntry.label === label);
        return <div className={styles.scoreEditEvent} key={zone}><span>Autonomous zone · {zone}</span><b>{entry ? `+${entry.points} pts` : "Not recorded"}</b>{entry ? <button className={styles.scoreRemoveButton} onClick={() => onRemove(entry.id)} disabled={saving}><Trash2 size={14} /> Remove</button> : <button className={styles.scoreAwardButton} onClick={() => onAdd("autonomy", 10, label)} disabled={saving}><Plus size={14} /> Add +10 points</button>}</div>;
      })}
      {penalties.map((entry) => <div className={styles.scoreEditEvent} key={entry.id}><span>{entry.label}</span><b>{entry.points} pts</b><button className={styles.scoreRemoveButton} onClick={() => onRemove(entry.id)} disabled={saving}><Trash2 size={14} /> Remove</button></div>)}
      <div className={styles.scoreEditChoices}><span>Add a penalty</span><button className={styles.scoreNeutralButton} onClick={() => onAdd("penalty", -3, "Topple · referee recovery · −3")} disabled={saving}><Plus size={14} /> Topple · −3</button><button className={styles.scoreNeutralButton} onClick={() => onAdd("penalty", -3, "Hand-touch · −3")} disabled={saving}><Plus size={14} /> Hand-touch · −3</button></div>
    </div>
    {saving && <small className={styles.scoreEditSaving}>Saving score changes…</small>}
  </section>;
}

export default function Scoreboard({ mode }: { mode: "public" | "admin" }) {
  const isAdmin = mode === "admin";
  const [snapshot, setSnapshot] = useState<{ state: CompetitionState; revision: string }>({
    state: emptyCompetitionState,
    revision: "",
  });
  const state = snapshot.state;
  const revision = snapshot.revision;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(!isAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [editingPastScoresTeamId, setEditingPastScoresTeamId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmScoresReset, setConfirmScoresReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());
  const savingRef = useRef(false);
  const loadControllerRef = useRef<AbortController | null>(null);
  const activityEventsRef = useRef<{ teamId: string; eventIds: Set<string> } | null>(null);
  const [activityToast, setActivityToast] = useState<ScoreEvent | null>(null);
  const [activityToastVisible, setActivityToastVisible] = useState(false);

  const loadState = useCallback(async () => {
    if (savingRef.current) return;
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    try {
      const response = await fetch("/api/robolympics/state", { cache: "no-store", signal: controller.signal });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load the score board.");
      if (controller.signal.aborted || savingRef.current) return;
      if (!result?.state || typeof result.revision !== "string") throw new Error("The score board response is incomplete. Reload the page.");
      setSnapshot({ state: result.state, revision: result.revision });
      setError("");
      setSaveError("");
      setReady(true);
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Could not connect to the score board.");
      setReady(true);
    } finally {
      if (loadControllerRef.current === controller) loadControllerRef.current = null;
    }
  }, []);

  useEffect(() => () => loadControllerRef.current?.abort(), []);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/robolympics/auth", { cache: "no-store" })
        .then((r) => r.json()).then((data) => setAuthenticated(Boolean(data.authenticated)))
        .catch(() => setAuthenticated(false)).finally(() => setAuthChecked(true));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !authChecked || !authenticated) return;
    void loadState();
    const poll = window.setInterval(() => { void loadState(); }, 5000);
    return () => window.clearInterval(poll);
  }, [isAdmin, authChecked, authenticated, loadState]);

  useEffect(() => {
    if (isAdmin) return;
    void loadState();
    const poll = window.setInterval(() => { void loadState(); }, 3000);
    return () => window.clearInterval(poll);
  }, [isAdmin, loadState]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const team = state.teams.find((candidate) => candidate.id === state.activeTeamId);
    if (!team) {
      activityEventsRef.current = null;
      setActivityToast(null);
      return;
    }

    const eventIds = new Set(team.events.map((entry) => entry.id));
    const previous = activityEventsRef.current;
    if (!previous || previous.teamId !== team.id) {
      activityEventsRef.current = { teamId: team.id, eventIds };
      return;
    }

    const added = team.events.filter((entry) => !previous.eventIds.has(entry.id));
    activityEventsRef.current = { teamId: team.id, eventIds };
    if (added.length) setActivityToast(added[added.length - 1]);
  }, [ready, state.activeTeamId, state.teams]);

  useEffect(() => {
    if (!activityToast) return;
    setActivityToastVisible(true);
    const hideTimer = window.setTimeout(() => setActivityToastVisible(false), 14_500);
    const clearTimer = window.setTimeout(() => setActivityToast(null), 15_000);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [activityToast]);

  const activeTeam = state.teams.find((team) => team.id === state.activeTeamId) ?? null;
  const editingPastScoresTeam = state.teams.find((team) => team.id === editingPastScoresTeamId && team.finished) ?? null;
  const running = Boolean(state.startedAt && !state.stoppedAt && activeTeam);
  const remaining = useMemo(() => {
    if (!state.startedAt) return MAX_RUN_SECONDS;
    return Math.max(0, MAX_RUN_SECONDS - (now - new Date(state.startedAt).getTime()) / 1000);
  }, [now, state.startedAt]);
  const recording = running && remaining > 0;
  const cleanRunRecorded = Boolean(activeTeam?.events.some((entry) => entry.key === "clean"));
  const sortedTeams = [...state.teams].sort((a, b) => totalFor(b.events) - totalFor(a.events) || a.name.localeCompare(b.name));

  async function persist(next: CompetitionState, expectedRevision: string): Promise<boolean> {
    if (savingRef.current) return false;
    loadControllerRef.current?.abort();
    loadControllerRef.current = null;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/robolympics/state", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseState: state, state: next, expectedRevision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this update.");
      if (typeof result.revision !== "string") throw new Error("The database did not confirm the saved version. Reload before continuing.");
      setSnapshot({ state: next, revision: result.revision });
      setSaveError("");
      return true;
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save this update.");
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function signIn(e: FormEvent) {
    e.preventDefault(); setError("");
    try {
      const response = await fetch("/api/robolympics/auth", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      setPassword(""); setAuthenticated(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); }
  }

  async function signOut() {
    await fetch("/api/robolympics/auth", { method: "DELETE" });
    setAuthenticated(false);
  }

  function addTeam(e: FormEvent) {
    e.preventDefault();
    const name = teamName.trim();
    if (!name || state.teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) return;
    void persist({ ...state, teams: [...state.teams, { id: newId(), name, events: [], finished: false }] }, revision)
      .then((saved) => { if (saved) setTeamName(""); });
  }

  async function deleteTeam(id: string) {
    if (running) return;
    const next = {
      ...state,
      teams: state.teams.filter((team) => team.id !== id),
      activeTeamId: state.activeTeamId === id ? null : state.activeTeamId,
      startedAt: state.activeTeamId === id ? null : state.startedAt,
      stoppedAt: state.activeTeamId === id ? null : state.stoppedAt,
    };
    if (await persist(next, revision)) {
      setTeamToDelete(null);
      if (editingPastScoresTeamId === id) setEditingPastScoresTeamId(null);
    }
  }

  function selectTeam(id: string) {
    if (running) return;
    void persist({ ...state, activeTeamId: state.activeTeamId === id ? null : id, startedAt: null, stoppedAt: null }, revision);
  }

  function startRun() {
    if (!activeTeam || activeTeam.finished) return;
    setEditingPastScoresTeamId(null);
    void persist({ ...state, startedAt: new Date().toISOString(), stoppedAt: null }, revision);
  }

  function addPastScore(key: ScoreKey, points: number, label: string) {
    if (running || !editingPastScoresTeam) return;
    const existing = editingPastScoresTeam.events;
    const singleAward = [...mainStages.map((stage) => stage.key), "clean"].includes(key);
    if (singleAward && existing.some((entry) => entry.key === key)) return;
    if (key === "shot" && existing.filter((entry) => entry.key === "shot").length >= 3) return;
    if (key === "autonomy" && existing.some((entry) => entry.label === label)) return;
    if (key === "speed") {
      const speedTotal = existing.filter((entry) => entry.key === "speed").reduce((sum, entry) => sum + entry.points, 0);
      if (points <= 0 || points % 2 !== 0 || speedTotal + points > 40) return;
    }
    const updated = { ...editingPastScoresTeam, events: [...existing, event(key, points, label)] };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team) }, revision);
  }

  function removePastScore(eventId: string) {
    if (running || !editingPastScoresTeam) return;
    const updated = { ...editingPastScoresTeam, events: editingPastScoresTeam.events.filter((entry) => entry.id !== eventId) };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team) }, revision);
  }

  function removePastScoreType(key: ScoreKey) {
    if (running || !editingPastScoresTeam) return;
    const updated = { ...editingPastScoresTeam, events: editingPastScoresTeam.events.filter((entry) => entry.key !== key) };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team) }, revision);
  }

  function record(key: ScoreKey, points: number, label?: string) {
    if (!activeTeam || !running) return;
    const updated = { ...activeTeam, events: [...activeTeam.events, event(key, points, label)] };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team) }, revision);
  }

  function finishRun() {
    if (!activeTeam || !running) return;
    const completedAt = new Date();
    const elapsed = (completedAt.getTime() - new Date(state.startedAt!).getTime()) / 1000;
    const events = [...activeTeam.events];
    const speedPoints = Math.floor(Math.max(0, MAX_RUN_SECONDS - elapsed) / 30) * 2;
    if (speedPoints > 0) events.push(event("speed", speedPoints, `Speed Escape · +${speedPoints} points`));
    const updated = { ...activeTeam, events, finished: true };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team), stoppedAt: completedAt.toISOString() }, revision);
  }

  useEffect(() => {
    if (isAdmin && authenticated && running && remaining <= 0) finishRun();
  }, [isAdmin, authenticated, running, remaining]);

  function undoLast() {
    if (!activeTeam || !running || !activeTeam.events.length) return;
    const events = activeTeam.events.slice(0, -1);
    const updated = { ...activeTeam, events };
    void persist({ ...state, teams: state.teams.map((team) => team.id === updated.id ? updated : team) }, revision);
  }

  async function resetCompetition() {
    if (await persist(emptyCompetitionState, revision)) {
      setConfirmReset(false);
      setConfirmScoresReset(false);
      setTeamToDelete(null);
      setEditingPastScoresTeamId(null);
    }
  }

  async function resetScoresKeepTeams() {
    const teams = state.teams.map((team) => ({ ...team, events: [], finished: false }));
    if (await persist({ teams, activeTeamId: null, startedAt: null, stoppedAt: null }, revision)) {
      setConfirmScoresReset(false);
      setConfirmReset(false);
      setTeamToDelete(null);
      setEditingPastScoresTeamId(null);
    }
  }

  const stageButtons = (team: CompetitionTeam) => mainStages.map((stage) => {
    const already = scoreFor(team.events, stage.key) > 0;
    return <button key={stage.key} className={`${styles.actionButton} ${already ? styles.recorded : ""}`} disabled={!recording || already || saving} onClick={() => record(stage.key, stage.points)}>
      {already ? <Check size={17} /> : <Plus size={17} />}<span><b>{stage.short}</b><small>{already ? "Recorded" : `+${stage.points} points`}</small></span>
    </button>;
  });

  if (isAdmin && !authChecked) return <main className={styles.shell}><div className={styles.loginCard}>Loading organizer console…</div></main>;
  if (isAdmin && !authenticated) return <main className={`${styles.shell} ${styles.loginShell}`}>
    <div className={styles.loginCard}>
      <a className={styles.backLink} href="/robolympics"><ArrowLeft size={16} /> Public scoreboard</a>
      <div className={styles.brandMark}><Shield size={25} /></div><p className={styles.eyebrow}>MISSION CONTROL</p>
      <h1>Organizer sign in</h1><p className={styles.muted}>Sign in to run Track I and record live results.</p>
      <form onSubmit={signIn} className={styles.loginForm}>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className={styles.primaryButton}>Sign in <ArrowLeft className={styles.flipIcon} size={18} /></button>
      </form>{error && <p className={styles.error}>{error}</p>}
    </div>
  </main>;

  return <main className={styles.shell}>
    <header className={styles.topbar}>
      <a href="/" className={styles.brand}><span className={styles.brandIcon}><img src="/Robolympics/aviation-club-logo.png" alt="Aviation Club" /></span><span>ROBOLYMPICS <small>2026 · AVIATION CLUB</small></span></a>
      <div className={styles.topRight}>{isAdmin ? <><span className={styles.adminBadge}><Shield size={14} /> ORGANIZER</span><button className={styles.iconButton} onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></> : state.track2?.matches.length ? <a className={styles.trackTwoButton} href="/robolympics/track2"><Trophy size={15} /> Track 2 live board</a> : null}</div>
    </header>
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}><span className={styles.liveDot} /> ROBOLYMPICS 2026 · TRACK I</p><h1>The Vault <em>Escape</em></h1></div>
      <div className={styles.heroMeta}><span>100</span><small>BASE POINTS</small><i /> <span>10:00</span><small>RUN LIMIT</small></div>
    </section>
    {(saveError || error) && <div className={styles.errorBanner}>{saveError || error}</div>}
    {!ready && <div className={styles.loading}>Connecting to the live score board…</div>}
    {ready && !error && !state.teams.length && <div className={styles.emptyNotice}><Users size={22} /><div><b>Teams are being set up</b><p>The live standings will appear once the organizer adds the team list.</p></div></div>}
    <section className={styles.nowPlaying}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ON THE COURSE</p><h2>Now playing</h2></div><span className={`${styles.statusPill} ${running ? styles.isLive : ""}`}><span />{running ? "LIVE RUN" : activeTeam?.finished ? "RUN COMPLETE" : "STANDBY"}</span></div>
      {activeTeam ? <div className={styles.playingCard}>
        <div className={styles.playerIdentity}><div className={styles.teamToken}><Flag size={21} /></div><div><small>ACTIVE TEAM</small><h3>{activeTeam.name}</h3><p>{running ? "Run in progress" : activeTeam.finished ? "Run complete · final score recorded" : "Waiting for the run to start"}</p></div></div>
        <div className={`${styles.timer} ${remaining <= 60 && running ? styles.timerWarning : ""}`}><Clock3 size={18} /><span>{formatTime(running ? remaining : activeTeam.finished && state.stoppedAt && state.startedAt ? Math.max(0, MAX_RUN_SECONDS - (new Date(state.stoppedAt).getTime() - new Date(state.startedAt).getTime()) / 1000) : MAX_RUN_SECONDS)}</span><small>{running && remaining === 0 ? "TIME UP" : "TIME REMAINING"}</small></div>
        <div className={styles.currentScore}><small>CURRENT SCORE</small><b>{totalFor(activeTeam.events)}<i> pts</i></b></div>
        {activityToast && <div key={activityToast.id} className={`${styles.actionToast} ${activityToast.points < 0 ? styles.actionToastPenalty : ""} ${activityToastVisible ? styles.actionToastVisible : ""}`} role="status" aria-live="polite"><Activity size={17} /><span className={styles.actionToastLabel}><small>LIVE RESULT</small>{activityToast.label}</span><b className={activityToast.points < 0 ? styles.actionPenalty : styles.actionPoints}>{activityToast.points > 0 ? "+" : ""}{activityToast.points} pts</b></div>}
      </div> : <div className={styles.noPlayer}><Radio size={19} />No team selected yet</div>}
      {isAdmin && <section className={styles.organizerPanel}>
        <div className={styles.panelTitle}><div><p className={styles.eyebrow}>ORGANIZER CONTROLS</p><h3>Run control</h3></div><div className={styles.panelActions}><span className={styles.quickHint} aria-live="polite">{saving ? "Saving changes…" : "Tap once to log each result"}</span><a className={styles.trackTwoButton} href="/robolympics/track2/admin"><Trophy size={15} /> Track 2 dashboard <ArrowLeft className={styles.flipIcon} size={15} /></a></div></div>
        {!running && <div className={styles.teamSetup}><form onSubmit={addTeam} className={styles.addTeamForm}><input aria-label="Team name" placeholder="Add a team before competition" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={saving} /><button disabled={!teamName.trim() || saving}><Plus size={16} /> Add team</button></form>
          {!!state.teams.length && <div className={styles.teamPicker}><span>SELECT TEAM · TAP AGAIN TO DESELECT</span>{state.teams.map((team) => <div key={team.id} className={styles.teamItem}><button onClick={() => selectTeam(team.id)} className={`${styles.teamChip} ${activeTeam?.id === team.id ? styles.selectedChip : ""}`} disabled={team.finished || saving} aria-pressed={activeTeam?.id === team.id}>{team.name}{team.finished && <Check size={14} />}</button>{team.finished && <button className={styles.editTeamButton} onClick={() => setEditingPastScoresTeamId(team.id)} disabled={saving} aria-label={`Edit ${team.name} scores`} title={`Edit ${team.name} scores`}><Pencil size={14} /></button>}<button className={styles.deleteTeamButton} onClick={() => setTeamToDelete(team.id)} disabled={saving} aria-label={`Delete ${team.name}`} title={`Delete ${team.name}`}><Trash2 size={14} /></button></div>)}</div>}
          {teamToDelete && <div className={styles.confirmRow} role="alertdialog" aria-label="Confirm team deletion"><span>Delete <b>{state.teams.find((team) => team.id === teamToDelete)?.name}</b> and its scores?</span><button className={styles.undoButton} disabled={saving} onClick={() => setTeamToDelete(null)}>Cancel</button><button className={styles.dangerButton} disabled={saving} onClick={() => void deleteTeam(teamToDelete)}>{saving ? "Saving…" : "Delete team"}</button></div>}
          {editingPastScoresTeam && <PastScoresEditor team={editingPastScoresTeam} saving={saving} onAdd={addPastScore} onRemove={removePastScore} onRemoveType={removePastScoreType} onDone={() => setEditingPastScoresTeamId(null)} />}
          {activeTeam && !activeTeam.finished && <button className={styles.startButton} onClick={startRun} disabled={saving}><Radio size={17} /> Start {activeTeam.name}&apos;s run <span>10:00</span></button>}
          {activeTeam?.finished && <p className={styles.muted}>This team&apos;s run is recorded. Select the next team above.</p>}
        </div>}
        {running && activeTeam && <>
          <div className={styles.controlsGrid}><div className={styles.controlGroup}><div className={styles.controlHeading}><span>01</span><b>Stage completion</b></div><div className={styles.actionGrid}>{stageButtons(activeTeam)}</div></div>
          <div className={styles.controlGroup}><div className={styles.controlHeading}><span>02</span><b>Precision shot · Stage 4.b</b></div><div className={styles.actionGrid}>{shotControls(activeTeam, recording, saving, record)}</div></div>
            <div className={styles.controlGroup}><div className={styles.controlHeading}><span>03</span><b>Clean run, bonuses & penalties</b></div><div className={styles.actionGrid}><button className={`${styles.actionButton} ${cleanRunRecorded ? styles.recorded : ""}`} disabled={!recording || cleanRunRecorded || saving} onClick={() => record("clean", 15, "Clean Run · +15 points")}><Check size={17} /><span><b>Award Clean Run</b><small>{cleanRunRecorded ? "Recorded · +15 points" : "+15 points · manual award"}</small></span></button>{["Torque Ramp", "Suspension Stairs", "Rubble Area", "Authentication Override"].map((zone) => { const already = activeTeam.events.some((entry) => entry.label === `Autonomous navigation · ${zone}`); return <button key={zone} className={`${styles.actionButton} ${already ? styles.recorded : ""}`} disabled={!recording || already || saving} onClick={() => record("autonomy", 10, `Autonomous navigation · ${zone}`)}><Activity size={17} /><span><b>Autonomous zone</b><small>{already ? "Recorded · +10 points" : `+10 · ${zone}`}</small></span></button>; })}<button className={`${styles.actionButton} ${styles.penaltyButton}`} disabled={!recording || saving} onClick={() => record("penalty", -3, "Topple · referee recovery · −3") }><Minus size={17} /><span><b>Topple / referee reset</b><small>−3 points</small></span></button><button className={`${styles.actionButton} ${styles.penaltyButton}`} disabled={!recording || saving} onClick={() => record("penalty", -3, "Hand-touch · −3")}><Minus size={17} /><span><b>Hand-touch</b><small>−3 points</small></span></button></div></div>
          </div>
          <div className={styles.runFooter}><button className={styles.undoButton} onClick={undoLast} disabled={!activeTeam.events.length || saving}><RotateCcw size={16} /> Undo last entry</button><div><span>Tap the result as it happens. Current total <b>{totalFor(activeTeam.events)} pts</b></span><button className={styles.finishButton} onClick={finishRun} disabled={saving}><CircleStop size={16} /> {saving ? "Saving…" : "End run"}</button></div></div>
        </>}
        {!running && state.teams.length > 0 && <div className={styles.resetArea}>
          {confirmScoresReset ? <div className={styles.confirmRow} role="alertdialog" aria-label="Confirm score reset"><span>Clear all team scores, run status, and the Track 2 packet while keeping the team list?</span><button className={styles.undoButton} disabled={saving} onClick={() => setConfirmScoresReset(false)}>Cancel</button><button className={styles.dangerButton} disabled={saving} onClick={() => void resetScoresKeepTeams()}>{saving ? "Resetting…" : "Confirm score reset"}</button></div> : <button className={styles.resetActionButton} onClick={() => { setConfirmReset(false); setConfirmScoresReset(true); }} disabled={saving}>Reset all scores · keep teams</button>}
          {confirmReset ? <div className={styles.confirmRow} role="alertdialog" aria-label="Confirm competition reset"><span>Delete every team, score and run record?</span><button className={styles.undoButton} disabled={saving} onClick={() => setConfirmReset(false)}>Cancel</button><button className={styles.dangerButton} disabled={saving} onClick={() => void resetCompetition()}>{saving ? "Resetting…" : "Confirm reset"}</button></div> : <button className={styles.resetActionButton} onClick={() => { setConfirmScoresReset(false); setConfirmReset(true); }} disabled={saving}>Reset all teams and scores</button>}
        </div>}
      </section>}
    </section>
    <section className={styles.standings}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>LIVE CLASSIFICATION</p><h2>Team standings</h2></div><span className={styles.teamCount}><Users size={15} /> {state.teams.length} TEAMS</span></div>
      <div className={styles.tableWrap}><table><thead><tr><th className={styles.rankHead}>RANK</th><th>TEAM</th><th className={styles.totalHead}>TOTAL</th>{mainStages.slice(0,4).map((s) => <th key={s.key} title={scoreLabels[s.key]}>{s.key.toUpperCase().replace("ZONE", "STAGE ")}</th>)}<th>AI</th><th>SHOT</th><th>EXIT</th><th>CLEAN</th><th>BONUS</th><th>PENALTY</th></tr></thead><tbody>{sortedTeams.map((team, index) => { const shotEvents = team.events.filter((entry) => entry.key === "shot"); return <tr key={team.id} className={team.id === activeTeam?.id && running ? styles.activeRow : ""}><td className={styles.rankCell}><span className={index < 3 ? styles.topRank : ""}>{String(index + 1).padStart(2, "0")}</span></td><td className={styles.teamCell}>{team.name}{team.id === activeTeam?.id && running && <small><i /> PLAYING</small>}</td><td className={styles.totalCell}>{totalFor(team.events)}<small>pts</small></td><td>{scoreFor(team.events, "zone1") || "—"}</td><td>{scoreFor(team.events, "zone2") || "—"}</td><td>{scoreFor(team.events, "zone3a") || "—"}</td><td>{scoreFor(team.events, "zone3b") || "—"}</td><td>{scoreFor(team.events, "detection") || "—"}</td><td>{shotEvents.length ? scoreFor(team.events, "shot") : "—"}</td><td>{scoreFor(team.events, "escape") || "—"}</td><td>{scoreFor(team.events, "clean") || "—"}</td><td className={styles.bonusCell}>{scoreFor(team.events, "speed") + scoreFor(team.events, "autonomy") || "—"}</td><td>{scoreFor(team.events, "penalty") || "—"}</td></tr>; })}</tbody></table>{!state.teams.length && ready && <div className={styles.tableEmpty}>The standings will populate when teams are added.</div>}</div>
      <div className={styles.tableNote}><span><Trophy size={15} /> Ranked by total points</span><span>Live updates every 3 seconds</span></div>
    </section>
    <footer className={styles.footer}><span>ROBOLYMPICS <b>·</b> AVIATION CLUB · AIN SHAMS UNIVERSITY</span></footer>
  </main>;
}
