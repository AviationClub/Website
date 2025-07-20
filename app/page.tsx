import AboutSection from "@/components/home-about-section";
import EventsSection from "@/components/home-events-section";
import HeroSection from "@/components/home-hero-section";
import SectionTitle from "@/components/section-title";
import TeamsSection from "@/components/home-teams-section";
import Banners from "@/components/banners";
import JoinUsSection from "@/components/home-join-us-section";
import LoadingManager from "@/components/loading-manager";
import { MIN_LOAD_TIME_PAGES } from "@/utils/constants";

export default function Home() {
  return (
    <LoadingManager minLoadTime={MIN_LOAD_TIME_PAGES}>
      <div className="flex h-full flex-col gap-8 font-sans">
        <main className="px-clamp flex-grow">
          <HeroSection />
          <div className="mt-[76.2vh]">
            <SectionTitle sectionTitle="Events" />
          </div>
          <EventsSection />
          <SectionTitle sectionTitle="Story" />
          <AboutSection />
          <SectionTitle sectionTitle="Teams" />
          <TeamsSection />
          <Banners />
          <JoinUsSection />
        </main>
      </div>
    </LoadingManager>
  );
}
