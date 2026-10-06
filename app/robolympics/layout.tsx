export default function RobolympicsLayout({ children }: { children: React.ReactNode }) {
  return <>
    <link rel="stylesheet" href="/Robolympics/scoreboard.css?v=track2-judge-decision" />
    {children}
  </>;
}
