import type { Metadata } from "next";
import TrackTwo from "../../../../public/Robolympics/track2";

export const metadata: Metadata = {
  title: "Organizer Console · Robolympics Track II",
  robots: { index: false, follow: false },
};

export default function TrackTwoAdminPage() {
  return <TrackTwo admin />;
}
