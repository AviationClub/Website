"use client";
import React, { useRef } from "react";
import { ABOUT_SECTIONS_CONTENT } from "@/utils/constants";
import AboutSection from "./about-section";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);

const AboutSections = () => {
  const sectionsContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      let mm = gsap.matchMedia();

      ABOUT_SECTIONS_CONTENT.forEach((_, sectionNumber) => {
        if (sectionNumber + 1 === ABOUT_SECTIONS_CONTENT.length) return;
        const bottomOffset =
          sectionNumber + 1 === ABOUT_SECTIONS_CONTENT.length - 1 ? 0 : 150;
        mm.add("(min-width:800px)", function() {
          gsap.timeline({
            scrollTrigger: {
              trigger: `.right-${sectionNumber}`,
              start: "top top",
              end: `bottom+=${bottomOffset} top`,
              pin: true,
              scrub: 0.8,
            },
          });
        });
      });
    },
    { scope: sectionsContainerRef },
  );

  return (
    <div
      ref={sectionsContainerRef}
      className="mt-[48.6rem] flex flex-col gap-[16rem]"
    >
      {ABOUT_SECTIONS_CONTENT.map((section, i) => (
        <AboutSection
          key={section.title}
          title={section.title}
          descriptionBefore={section.descriptionBefore}
          descriptionAfter={section.descriptionAfter}
          inBetweenWord={section.inBetweenWord}
          imgSrc={section.imgSrc}
          className={`section-${i + 1}`}
          sectionNumber={i}
        />
      ))}
    </div>
  );
};

export default AboutSections;
