"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Medal, Trophy } from "lucide-react";
import type { CompetitionState, TrackTwoMatch } from "./score-model";
import { emptyCompetitionState } from "./score-model";

const styles = new Proxy({} as Record<string, string>, { get: (_target, key) => typeof key === "string" ? key : "" });

export default function RobolympicsResults() {
  const [state, setState] = useState<CompetitionState>(emptyCompetitionState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/robolympics/state", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load final results.");
        if (mounted) { setState(result.state); setError(""); }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Could not load final results.");
      } finally {
        if (mounted) setReady(true);
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 3000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  const placements = useMemo(() => {
    const teams = new Map(state.teams.map((team) => [team.id, team.name]));
    const matches = state.track2?.matches ?? [];
    const final: TrackTwoMatch | undefined = matches.find((match) => match.round === "final");
    const third: TrackTwoMatch | undefined = matches.find((match) => match.round === "thirdPlace");
    if (final?.status !== "complete" || !final.winnerId || !final.teamAId || !final.teamBId || third?.status !== "complete" || !third.winnerId) return null;
    const silverId = final.winnerId === final.teamAId ? final.teamBId : final.teamAId;
    return [
      { place: 1, medal: "gold", name: teams.get(final.winnerId) ?? "Champion", note: "TRACK 2 CHAMPION" },
      { place: 2, medal: "silver", name: teams.get(silverId) ?? "Runner-up", note: "FINALIST" },
      { place: 3, medal: "bronze", name: teams.get(third.winnerId) ?? "Third place", note: "THIRD PLACE" },
    ] as const;
  }, [state]);
  const completedBracket = useMemo(() => {
    const matches = state.track2?.matches ?? [];
    const quarterfinals = matches.filter((match) => match.round === "quarterfinal").sort((a, b) => a.slot - b.slot);
    const semifinals = matches.filter((match) => match.round === "semifinal").sort((a, b) => a.slot - b.slot);
    const final = matches.find((match) => match.round === "final");
    const thirdPlace = matches.find((match) => match.round === "thirdPlace");
    if (!placements || quarterfinals.length !== 4 || semifinals.length !== 2 || !final || !thirdPlace || [...quarterfinals, ...semifinals, final, thirdPlace].some((match) => match.status !== "complete")) return null;
    return { quarterfinals, semifinals, final, thirdPlace, teams: new Map(state.teams.map((team) => [team.id, team.name])) };
  }, [placements, state]);

  return <main className={styles.shell}>
    <header className={styles.topbar}>
      <a href="/robolympics" className={styles.brand}><span className={styles.brandIcon}><img src="/Robolympics/aviation-club-logo.png" alt="Aviation Club" /></span><span>ROBOLYMPICS <small>2026 · AWARDS</small></span></a>
      <a className={styles.secondaryButton} href="/robolympics/track2"><ArrowLeft size={16} /> Track 2 results</a>
    </header>
    <section className={`${styles.hero} ${styles.resultsHero}`}>
      <div><p className={styles.eyebrow}><Trophy size={15} /> ROBOLYMPICS 2026 · FINAL STANDINGS</p><h1>The <em>Podium</em></h1><p className={styles.heroCopy}>Celebrating the teams who finished at the top of Track 2.</p></div>
      {placements && <div className={styles.resultsComplete}><span /><b>FINAL RESULTS</b></div>}
    </section>
    {error && <div className={styles.errorBanner}>{error}</div>}
    {!ready && <div className={styles.loading}>Loading the final results…</div>}
    {ready && !placements && <section className={styles.resultsWaiting}><Trophy size={25} /><div><b>The podium is being prepared</b><p>The gold, silver, and bronze positions will appear after the final and third-place match are complete.</p></div><span>LIVE UPDATES</span></section>}
    {placements && <section className={styles.podium} aria-label="Final Track 2 podium">
      {placements.map((team) => <article key={team.place} className={`${styles.podiumStep} ${styles[`podium${team.medal[0].toUpperCase()}${team.medal.slice(1)}`]}`}>
        <div className={styles.podiumMedal}>{team.place === 1 ? <Crown size={26} /> : <Medal size={25} />}<span>{team.place}</span></div>
        <small>{team.note}</small><h2>{team.name}</h2><div className={styles.podiumBase}><span>{team.place === 1 ? "GOLD" : team.place === 2 ? "SILVER" : "BRONZE"}</span><b>{team.place}</b></div>
      </article>)}
    </section>}
    {completedBracket && <section className={styles.fullBracket} aria-label="Complete Track 2 tournament bracket">
      <div className={styles.fullBracketHeading}><div><p className={styles.eyebrow}>THE ROAD TO THE FINAL</p><h2>Complete tournament bracket</h2></div><span>8 TEAMS · 8 MATCHES</span></div>
      <div className={styles.bracketColumns}>
        <section className={styles.bracketRound}><header><small>ROUND 1</small><b>Quarterfinals</b></header><div className={styles.bracketMatchList}>{completedBracket.quarterfinals.map((match) => <BracketMatch key={match.id} match={match} teams={completedBracket.teams} />)}</div></section>
        <div className={styles.bracketAdvance} aria-hidden="true">›</div>
        <section className={styles.bracketRound}><header><small>ROUND 2</small><b>Semifinals</b></header><p className={styles.bracketFeed}>QF 1 winner vs QF 2 winner</p><BracketMatch match={completedBracket.semifinals[0]} teams={completedBracket.teams} /><p className={styles.bracketFeed}>QF 3 winner vs QF 4 winner</p><BracketMatch match={completedBracket.semifinals[1]} teams={completedBracket.teams} /></section>
        <div className={styles.bracketAdvance} aria-hidden="true">›</div>
        <section className={styles.bracketRound}><header><small>PLACEMENT & CHAMPIONSHIP</small><b>Final rounds</b></header><p className={styles.bracketFeed}>Semifinal losers · played before the final</p><BracketMatch match={completedBracket.thirdPlace} teams={completedBracket.teams} /><p className={styles.bracketFeed}>Semifinal winners</p><BracketMatch match={completedBracket.final} teams={completedBracket.teams} /></section>
      </div>
    </section>}
    <nav className={styles.resultsLinks}><a href="/robolympics/track2"><ArrowLeft size={16} /> View the championship rounds</a><a href="/robolympics">Track 1 standings</a></nav>
    <footer className={styles.footer}><span>ROBOLYMPICS <b>·</b> AVIATION CLUB · AIN SHAMS UNIVERSITY</span></footer>
  </main>;
}

function BracketMatch({ match, teams }: { match: TrackTwoMatch; teams: Map<string, string> }) {
  const games = match.games ?? [];
  const name = (id: string | null) => id ? teams.get(id) ?? "Team" : "—";
  const wins = (id: string | null) => id ? games.filter((game) => game.winnerId === id).length : 0;
  return <article className={styles.bracketMatch}>
    <div className={styles.bracketTeam}><span>{name(match.teamAId)}</span><b>{wins(match.teamAId)}</b>{match.winnerId === match.teamAId && <i>WINNER</i>}</div>
    <div className={styles.bracketTeam}><span>{name(match.teamBId)}</span><b>{wins(match.teamBId)}</b>{match.winnerId === match.teamBId && <i>WINNER</i>}</div>
    <div className={styles.bracketGameLog}>{games.map((game) => <span key={game.number}>M{game.number}: {name(game.winnerId)}</span>)}</div>
  </article>;
}
