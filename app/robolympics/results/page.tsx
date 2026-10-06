import type { Metadata } from "next";
import RobolympicsResults from "../../../public/Robolympics/results";

export const metadata: Metadata = {
  title: "Robolympics · Final Podium",
  description: "Final gold, silver, and bronze placements for the Robolympics championship.",
};

export default function ResultsPage() {
  return <RobolympicsResults />;
}
