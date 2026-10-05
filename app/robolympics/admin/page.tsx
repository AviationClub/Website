import type { Metadata } from "next";
import Scoreboard from "../../../public/Robolympics/scoreboard";

export const metadata: Metadata = {
  title: "Organizer Console · Robolympics",
  robots: { index: false, follow: false },
};

export default function RobolympicsAdminPage() {
  return <Scoreboard mode="admin" />;
}
