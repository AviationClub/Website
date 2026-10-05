import type { Metadata } from "next";
import Scoreboard from "../../public/Robolympics/scoreboard";

export const metadata: Metadata = {
  title: "Robolympics · Track I Live Scores",
  description: "Live Track I scores and team rankings for Robolympics 2026.",
};

export default function RobolympicsPage() {
  return <Scoreboard mode="public" />;
}
