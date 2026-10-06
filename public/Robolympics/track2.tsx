"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Crown, Flag, LoaderCircle, LogOut, Radio, Shield, Shuffle, Trophy } from "lucide-react";
import type { CompetitionState, CompetitionTeam, TrackTwoGameResult, TrackTwoMatch, TrackTwoRound, TrackTwoState } from "./score-model";
import { emptyCompetitionState, totalFor } from "./score-model";

const styles = new Proxy({} as Record<string, string>, { get: (_target, key) => typeof key === "string" ? key : "" });
const roundOrder: TrackTwoRound[] = ["quarterfinal", "semifinal", "final", "thirdPlace"];
const roundNames: Record<TrackTwoRound, string> = { quarterfinal: "Quarterfinals", semifinal: "Semifinals", final: "Final", thirdPlace: "Third-place match" };
const winsNeeded = (round: TrackTwoRound) => round === "quarterfinal" ? 2 : 3;
const winsBy = (match: TrackTwoMatch, teamId: string | null) => teamId ? (match.games ?? []).filter((game) => game.winnerId === teamId).length : 0;
const placeNames = ["1st place", "2nd place", "3rd place", "4th place", "5th place", "6th place", "7th place", "8th place"];
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function ranked(teams: CompetitionTeam[]) {
  return [...teams].sort((a, b) => totalFor(b.events) - totalFor(a.events) || a.name.localeCompare(b.name));
}

function getCurrentRound(track: TrackTwoState | undefined): TrackTwoRound | null {
  if (!track?.matches.length) return null;
  return roundOrder.find((round) => track.matches.some((match) => match.round === round && match.status !== "complete")) ?? null;
}

export default function TrackTwo({ admin = false }: { admin?: boolean }) {
  const [snapshot, setSnapshot] = useState<{ state: CompetitionState; revision: string }>({ state: emptyCompetitionState, revision: "" });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(!admin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [draftTeamIds, setDraftTeamIds] = useState<string[] | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [boutToast, setBoutToast] = useState<{ id: string; title: string; detail: string } | null>(null);
  const [boutToastVisible, setBoutToastVisible] = useState(false);
  const savingRef = useRef(false);
  const boutTrackerRef = useRef<Map<string, Set<number>> | null>(null);
  const state = snapshot.state;
  const track = state.track2;
  const rankedTeams = useMemo(() => ranked(state.teams), [state.teams]);
  const teamsById = useMemo(() => new Map(state.teams.map((team) => [team.id, team])), [state.teams]);
  const round = getCurrentRound(track);
  const displayRound = round ?? (track?.matches.some((match) => match.round === "thirdPlace") ? "thirdPlace" : track?.matches.length ? "final" : null);
  const activeMatch = track?.matches.find((match) => match.id === track.activeMatchId) ?? null;
  const currentMatches = displayRound && track ? track.matches.filter((match) => match.round === displayRound) : [];
  const previousRound = displayRound ? roundOrder[roundOrder.indexOf(displayRound) - 1] : null;
  const previousMatches = previousRound && track ? track.matches.filter((match) => match.round === previousRound && match.status === "complete") : [];
  const championMatch = track?.matches.find((match) => match.round === "final");
  const champion = championMatch?.winnerId ? teamsById.get(championMatch.winnerId) : null;
  const thirdPlaceMatch = track?.matches.find((match) => match.round === "thirdPlace");
  const podiumReady = Boolean(championMatch?.status === "complete" && championMatch.winnerId && thirdPlaceMatch?.status === "complete" && thirdPlaceMatch.winnerId);

  const loadState = useCallback(async () => {
    try {
      const response = await fetch("/api/robolympics/state", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load Track 2.");
      setSnapshot({ state: result.state, revision: result.revision });
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Track 2.");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    fetch("/api/robolympics/auth", { cache: "no-store" }).then((r) => r.json())
      .then((result) => setAuthenticated(Boolean(result.authenticated)))
      .catch(() => setAuthenticated(false)).finally(() => setAuthChecked(true));
  }, [admin]);

  useEffect(() => {
    if (admin && (!authChecked || !authenticated)) return;
    void loadState();
    const timer = window.setInterval(() => { if (!savingRef.current) void loadState(); }, 3000);
    return () => window.clearInterval(timer);
  }, [admin, authChecked, authenticated, loadState]);

  useEffect(() => {
    if (!ready) return;
    const matches = state.track2?.matches ?? [];
    const previous = boutTrackerRef.current;
    const current = new Map(matches.map((match) => [match.id, new Set((match.games ?? []).map((game) => game.number))]));
    if (!previous) {
      boutTrackerRef.current = current;
      return;
    }
    const added = matches.flatMap((match) => (match.games ?? [])
      .filter((game) => !previous.get(match.id)?.has(game.number))
      .map((game) => ({ match, game })));
    boutTrackerRef.current = current;
    const latest = added.sort((a, b) => (a.game.at ?? "").localeCompare(b.game.at ?? "") || a.game.number - b.game.number).at(-1);
    if (latest) {
      const winner = teamsById.get(latest.game.winnerId)?.name ?? "Team";
      const scoreA = winsBy(latest.match, latest.match.teamAId);
      const scoreB = winsBy(latest.match, latest.match.teamBId);
      setBoutToast({
        id: `${latest.match.id}-${latest.game.number}-${latest.game.at ?? Date.now()}`,
        title: `${winner} wins match ${latest.game.number}`,
        detail: `${roundNames[latest.match.round]} · Series ${scoreA}–${scoreB}`,
      });
    }
  }, [ready, state.track2, teamsById]);

  useEffect(() => {
    if (!boutToast) return;
    setBoutToastVisible(true);
    const hideTimer = window.setTimeout(() => setBoutToastVisible(false), 14_500);
    const clearTimer = window.setTimeout(() => setBoutToast(null), 15_000);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [boutToast]);

  async function persist(next: CompetitionState) {
    if (savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/robolympics/state", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseState: state, state: next, expectedRevision: snapshot.revision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save Track 2.");
      setSnapshot({ state: next, revision: result.revision });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save Track 2.");
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/robolympics/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not sign in.");
      setPassword("");
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  async function signOut() {
    await fetch("/api/robolympics/auth", { method: "DELETE" });
    setAuthenticated(false);
  }

  function beginDraft() {
    setDraftTeamIds(Array.from({ length: 8 }, (_, index) => rankedTeams[index]?.id ?? ""));
  }

  async function replacePacket() {
    const { track2: _oldPacket, ...stateWithoutPacket } = state;
    if (await persist(stateWithoutPacket)) {
      setConfirmReplace(false);
      beginDraft();
    }
  }

  async function createBracket(selectedIds: string[]) {
    const uniqueIds = new Set(selectedIds.filter(Boolean));
    if (selectedIds.length !== 8 || uniqueIds.size !== 8) {
      setError("Select eight different teams before creating the random packet.");
      return;
    }
    const seeds = selectedIds.map((id) => teamsById.get(id)).filter((team): team is CompetitionTeam => Boolean(team));
    if (seeds.length !== 8) {
      setError("A selected team is no longer in the Track 1 standings. Refresh the list and try again.");
      return;
    }
    for (let i = seeds.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
    }
    const matches: TrackTwoMatch[] = [
      ...Array.from({ length: 4 }, (_, slot) => ({ id: newId(), round: "quarterfinal" as const, slot, teamAId: seeds[slot * 2].id, teamBId: seeds[slot * 2 + 1].id, winnerId: null, status: "pending" as const, games: [] })),
      ...Array.from({ length: 2 }, (_, slot) => ({ id: newId(), round: "semifinal" as const, slot, teamAId: null, teamBId: null, winnerId: null, status: "pending" as const, games: [] })),
      { id: newId(), round: "final", slot: 0, teamAId: null, teamBId: null, winnerId: null, status: "pending", games: [] },
      { id: newId(), round: "thirdPlace", slot: 0, teamAId: null, teamBId: null, winnerId: null, status: "pending", games: [] },
    ];
    if (await persist({ ...state, track2: { matches, activeMatchId: null, createdAt: new Date().toISOString() } })) setDraftTeamIds(null);
  }

  async function startMatch(matchId: string) {
    if (!track) return;
    const matches = track.matches.map((match) => match.id === matchId ? { ...match, status: "playing" as const, games: match.games ?? [] } : match);
    await persist({ ...state, track2: { ...track, matches, activeMatchId: matchId } });
  }

  async function recordBout(matchId: string, winnerId: string) {
    if (!track) return;
    const match = track.matches.find((item) => item.id === matchId);
    if (!match || match.status !== "playing" || ![match.teamAId, match.teamBId].includes(winnerId)) return;
    const games: TrackTwoGameResult[] = [...(match.games ?? []), { number: (match.games?.length ?? 0) + 1, winnerId, at: new Date().toISOString() }];
    const teamAWins = winsBy({ ...match, games }, match.teamAId);
    const teamBWins = winsBy({ ...match, games }, match.teamBId);
    const seriesWinner = teamAWins >= winsNeeded(match.round) ? match.teamAId : teamBWins >= winsNeeded(match.round) ? match.teamBId : null;
    const matches = track.matches.map((item) => item.id === matchId ? { ...item, games, status: seriesWinner ? "complete" as const : "playing" as const, winnerId: seriesWinner } : { ...item, games: item.games ?? [] });

    if (seriesWinner && match.round === "quarterfinal") {
      const nextMatch = matches.find((item) => item.round === "semifinal" && item.slot === Math.floor(match.slot / 2));
      if (nextMatch) {
        if (match.slot % 2 === 0) nextMatch.teamAId = seriesWinner;
        else nextMatch.teamBId = seriesWinner;
      }
    }
    if (seriesWinner && match.round === "semifinal") {
      const nextFinal = matches.find((item) => item.round === "final");
      const bronzeMatch = matches.find((item) => item.round === "thirdPlace") ?? {
        id: newId(), round: "thirdPlace" as const, slot: 0, teamAId: null, teamBId: null, winnerId: null, status: "pending" as const, games: [],
      };
      if (!matches.some((item) => item.round === "thirdPlace")) matches.push(bronzeMatch);
      const isA = match.slot === 0;
      if (nextFinal) {
        if (isA) nextFinal.teamAId = seriesWinner;
        else nextFinal.teamBId = seriesWinner;
      }
      const loserId = seriesWinner === match.teamAId ? match.teamBId : match.teamAId;
      if (isA) bronzeMatch.teamAId = loserId;
      else bronzeMatch.teamBId = loserId;
    }

    const allMatchesInRoundComplete = matches.filter((item) => item.round === match.round).every((item) => item.status === "complete");
    await persist({ ...state, track2: { ...track, matches, activeMatchId: seriesWinner || allMatchesInRoundComplete ? null : matchId } });
  }

  function matchName(match: TrackTwoMatch, side: "A" | "B") {
    const id = side === "A" ? match.teamAId : match.teamBId;
    return id ? teamsById.get(id)?.name ?? "Team" : "To be decided";
  }

  if (admin && !authChecked) return <main className={styles.shell}><div className={styles.loading}>Checking organizer access…</div></main>;
  if (admin && !authenticated) return <main className={`${styles.shell} ${styles.loginShell}`}>
    <div className={styles.loginCard}><a className={styles.backLink} href="/robolympics/admin"><ArrowLeft size={16} /> Track 1 organizer</a><div className={styles.brandMark}><Shield size={25} /></div><p className={styles.eyebrow}>MISSION CONTROL · TRACK 2</p><h1>Organizer sign in</h1><p className={styles.muted}>Sign in to manage the elimination rounds.</p>
      <form onSubmit={signIn} className={styles.loginForm}><label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className={styles.primaryButton}>Sign in</button></form>{error && <p className={styles.error}>{error}</p>}
    </div>
  </main>;

  const selectedCount = draftTeamIds?.filter(Boolean).length ?? 0;
  return <main className={`${styles.shell} ${admin ? styles.adminShell : ""}`}>
    <header className={styles.topbar}>
      <a href="/robolympics" className={styles.brand}><span className={styles.brandIcon}><img src="/Robolympics/aviation-club-logo.png" alt="Aviation Club" /></span><span>ROBOLYMPICS <small>2026 · TRACK II</small></span></a>
      <div className={styles.topRight}>{admin ? <><span className={styles.adminBadge}><Shield size={14} /> ORGANIZER</span><button className={styles.iconButton} onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></> : <a className={styles.trackTwoButton} href="/robolympics/track2">Track 2 live board</a>}</div>
    </header>
    <section className={styles.hero}><div><p className={styles.eyebrow}><span className={styles.liveDot} /> ROBOLYMPICS 2026 · TRACK II</p><h1>Championship <em>Rounds</em></h1><p className={styles.heroCopy}>A live knockout bracket featuring the organizer-selected Track 1 teams.</p></div><div className={styles.heroMeta}><Trophy size={18} /><small>QUARTERFINALS · SEMIFINALS · FINAL · THIRD PLACE</small></div></section>
    {!admin && podiumReady && <a className={styles.t2PodiumLink} href="/robolympics/results"><Trophy size={19} /><span><b>Final results and podium</b><small>See the gold, silver, and bronze medal teams</small></span><ArrowLeft size={18} /></a>}
    {error && <div className={styles.errorBanner}>{error}</div>}
    {!ready && <div className={styles.loading}><LoaderCircle size={17} /> Connecting to the live bracket…</div>}
    {ready && !track?.matches.length && admin && draftTeamIds && <section className={styles.t2SelectionPanel}>
      <div className={styles.t2SectionHead}><div><p className={styles.eyebrow}>RANDOM DRAW · TEAM SELECTION</p><h2>Choose the eight entrants</h2></div><span className={styles.t2RoundCount}>{selectedCount} / 8 SELECTED</span></div>
      <p className={styles.t2SelectionIntro}>Review the ranked slots below. Change any team; only these eight selections will enter the random draw.</p>
      <div className={styles.t2SeedList}>{placeNames.map((place, index) => {
        const selectedId = draftTeamIds[index] ?? "";
        const selectedElsewhere = new Set(draftTeamIds.filter((id, otherIndex) => id && otherIndex !== index));
        return <label className={styles.t2SeedRow} key={place}><span><b>{place}</b><small>DRAW SLOT {String(index + 1).padStart(2, "0")}</small></span><select value={selectedId} onChange={(event) => setDraftTeamIds((current) => current?.map((id, rowIndex) => rowIndex === index ? event.target.value : id) ?? null)}><option value="">Select a team</option>{rankedTeams.map((team) => <option key={team.id} value={team.id} disabled={selectedElsewhere.has(team.id)}>{team.name} · {totalFor(team.events)} pts</option>)}</select></label>;
      })}</div>
      <div className={styles.t2SelectionFooter}><button className={styles.undoButton} onClick={() => setDraftTeamIds(null)} disabled={saving}>Cancel</button><button className={styles.primaryButton} onClick={() => void createBracket(draftTeamIds)} disabled={saving || selectedCount !== 8 || new Set(draftTeamIds.filter(Boolean)).size !== 8}><Shuffle size={16} />{saving ? "Creating packet…" : "Randomize selected teams"}</button></div>
    </section>}
    {ready && !track?.matches.length && (!admin || !draftTeamIds) && <section className={styles.t2Setup}><div className={styles.teamToken}><Shuffle size={20} /></div><div><h2>Track 2 bracket</h2><p>{admin ? "Choose eight ranked entries, adjust any team, then create the random packet." : "The organizer is preparing the eight entrants for the random draw."}</p></div>{admin && <button className={styles.primaryButton} onClick={beginDraft} disabled={saving || rankedTeams.length < 8}><Shuffle size={16} /> Create a random packet</button>}</section>}
    {admin && ready && !track?.matches.length && rankedTeams.length < 8 && <p className={styles.t2Hint}>Track 1 currently has {rankedTeams.length} teams. At least 8 are needed to create the draw.</p>}
    {track && track.matches.length >= 7 && <>
      <section className={styles.t2NowPlaying}>
        <div className={styles.t2SectionHead}><div><p className={styles.eyebrow}>LIVE MATCH</p><h2>{activeMatch ? roundNames[activeMatch.round] : champion && !round ? "Tournament champion" : round ? roundNames[round] : "Tournament complete"}</h2></div><span className={`${styles.statusPill} ${activeMatch ? styles.isLive : ""}`}><span />{activeMatch ? "IN PROGRESS" : !round && champion ? "COMPLETE" : "UP NEXT"}</span></div>
        {activeMatch ? <div className={styles.t2FeatureMatch}><div className={styles.t2Contestants}><span>{matchName(activeMatch, "A")}<strong>{winsBy(activeMatch, activeMatch.teamAId)}</strong></span><b>VS</b><span>{matchName(activeMatch, "B")}<strong>{winsBy(activeMatch, activeMatch.teamBId)}</strong></span></div><p>{roundNames[activeMatch.round]} · Match {activeMatch.slot + 1} · First to {winsNeeded(activeMatch.round)} wins · Match {(activeMatch.games ?? []).length + 1}</p>{boutToast && <div key={boutToast.id} className={`${styles.t2LiveAction} ${boutToastVisible ? styles.t2LiveActionVisible : ""}`} role="status" aria-live="polite"><Check size={17} /><span><small>LIVE MATCH RESULT</small><b>{boutToast.title}</b><em>{boutToast.detail}</em></span></div>}</div> : champion && !round ? <div className={styles.t2Champion}><Crown size={24} /><span>{champion.name}</span><small>TRACK 2 CHAMPION</small></div> : <div className={styles.noPlayer}><Radio size={19} />Waiting for the organizer to start the next match.</div>}
      </section>
      {displayRound && <section className={styles.t2RoundSection}><div className={styles.t2SectionHead}><div><p className={styles.eyebrow}>{displayRound === "thirdPlace" ? "PLACEMENT MATCH · AFTER THE FINAL" : `ROUND ${roundOrder.indexOf(displayRound) + 1} OF 3`}</p><h2>{roundNames[displayRound]}</h2></div><span className={styles.t2RoundCount}>{currentMatches.filter((match) => match.status === "complete").length} / {currentMatches.length} COMPLETE</span></div><div className={styles.t2MatchGrid}>{currentMatches.map((match) => <MatchCard key={match.id} match={match} nameA={matchName(match, "A")} nameB={matchName(match, "B")} admin={admin} saving={saving} canStart={!track.activeMatchId && !saving} isActive={match.id === track.activeMatchId} onStart={() => void startMatch(match.id)} onBout={(winnerId) => void recordBout(match.id, winnerId)} />)}</div></section>}
      {previousRound && previousMatches.length > 0 && <section className={styles.t2RoundSection}><div className={styles.t2SectionHead}><div><p className={styles.eyebrow}>COMPLETED</p><h2>Previous round · {roundNames[previousRound]}</h2></div></div><div className={styles.t2MatchGrid}>{previousMatches.map((match) => <MatchCard key={match.id} match={match} nameA={matchName(match, "A")} nameB={matchName(match, "B")} admin={false} saving={false} canStart={false} isActive={false} onStart={() => undefined} onBout={() => undefined} />)}</div></section>}
    </>}
    {admin && <section className={styles.t2AdminNav}><div><p className={styles.eyebrow}>ORGANIZER</p><h2>Track 2 control</h2><p>Start each match, then tap the winning team to advance it to the next round.</p></div>{track?.matches.length && !confirmReplace ? <button className={styles.dangerButton} onClick={() => setConfirmReplace(true)} disabled={saving}>Replace random packet</button> : null}<a className={styles.secondaryButton} href="/robolympics/admin"><ArrowLeft size={16} /> Back to Track 1</a>
      {confirmReplace && <div className={styles.t2ReplaceConfirm} role="alertdialog" aria-label="Confirm replacement of Track 2 packet"><span>This clears all Track 2 matches and results before selecting a new set of teams.</span><button className={styles.undoButton} onClick={() => setConfirmReplace(false)} disabled={saving}>Cancel</button><button className={styles.dangerButton} onClick={() => void replacePacket()} disabled={saving}>{saving ? "Clearing…" : "Clear and choose teams"}</button></div>}
    </section>}
    <footer className={styles.footer}><span>ROBOLYMPICS <b>·</b> AVIATION CLUB · AIN SHAMS UNIVERSITY</span>{!admin && <a href="/robolympics">Track 1 standings</a>}</footer>
  </main>;
}

function MatchCard({ match, nameA, nameB, admin, saving, canStart, isActive, onStart, onBout }: {
  match: TrackTwoMatch; nameA: string; nameB: string; admin: boolean; saving: boolean; canStart: boolean; isActive: boolean;
  onStart: () => void; onBout: (teamId: string) => void;
}) {
  const ready = Boolean(match.teamAId && match.teamBId);
  const games = match.games ?? [];
  const legacyResult = match.status === "complete" && games.length === 0 && Boolean(match.winnerId);
  return <article className={`${styles.t2MatchCard} ${isActive ? styles.t2ActiveMatch : ""}`}>
    <div className={styles.t2MatchTop}><span>{roundNames[match.round]} · Match {String(match.slot + 1).padStart(2, "0")}</span><b>{match.status === "complete" ? "FINAL" : isActive ? "LIVE" : "UP NEXT"}</b></div>
    <div className={`${styles.t2TeamRow} ${match.winnerId === match.teamAId ? styles.t2Winner : ""}`}><span>{nameA}</span>{!legacyResult && <b className={styles.t2BoutScore}>{winsBy(match, match.teamAId)}</b>}{match.winnerId === match.teamAId && <Check size={16} />}</div>
    <div className={`${styles.t2TeamRow} ${match.winnerId === match.teamBId ? styles.t2Winner : ""}`}><span>{nameB}</span>{!legacyResult && <b className={styles.t2BoutScore}>{winsBy(match, match.teamBId)}</b>}{match.winnerId === match.teamBId && <Check size={16} />}</div>
    <p className={styles.t2SeriesRule}>{legacyResult ? "Winner recorded before series tracking" : `Best of ${match.round === "quarterfinal" ? 3 : 5} · First to ${winsNeeded(match.round)}`}</p>
    {games.length > 0 && <div className={styles.t2BoutLog}>{games.map((game) => <span key={game.number}>Match {game.number} · {game.winnerId === match.teamAId ? nameA : nameB}</span>)}</div>}
    {match.status === "complete" && <p className={styles.t2Result}>Winner · {match.winnerId === match.teamAId ? nameA : nameB}</p>}
    {admin && match.status === "pending" && ready && <button className={styles.secondaryButton} onClick={onStart} disabled={!canStart}><Radio size={15} /> Start match</button>}
    {admin && isActive && <div className={styles.t2WinnerActions}><small>RECORD MATCH {games.length + 1} WINNER</small><button onClick={() => match.teamAId && onBout(match.teamAId)} disabled={saving}>{nameA} wins this match</button><button onClick={() => match.teamBId && onBout(match.teamBId)} disabled={saving}>{nameB} wins this match</button></div>}
  </article>;
}
