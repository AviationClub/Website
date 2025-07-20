// Components
import AboutHeroSection from "@/components/about-hero-section";
import AboutJoinUsSection from "@/components/about-join-us-section";
import AboutSections from "@/components/about-sections";
import AboutEmptySection from "@/components/about-empty-section";
import LoadingManager from "@/components/loading-manager";
import { MIN_LOAD_TIME_PAGES } from "@/utils/constants";

// The image fall from above and the text comes from sides on load and the bar beside "scroll to" should scale up and down
const AboutPage = () => {
  return (
    <LoadingManager minLoadTime={MIN_LOAD_TIME_PAGES}>
      <main className="px-clamp">
        <AboutHeroSection />
        <AboutSections />
        <AboutEmptySection />
        <AboutJoinUsSection />
        {/* <Canvas3D mainRef={mainRef} sectionHeight={sectionHeight} /> */}
      </main>
    </LoadingManager>
  );
};

export default AboutPage;
