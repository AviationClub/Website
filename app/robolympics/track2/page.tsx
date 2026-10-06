import type { Metadata } from "next";
import TrackTwo from "../../../public/Robolympics/track2";

export const metadata: Metadata = {
  title: "Robolympics · Track II Championship Rounds",
  description: "Live Track II quarterfinal, semifinal, and final results.",
};

export default function TrackTwoPage() {
  return <TrackTwo />;
}
