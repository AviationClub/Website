"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

type SectionTitlePropsType = {
  sectionTitle: string;
};

const SectionTitle = ({ sectionTitle }: SectionTitlePropsType) => {
  const container = useRef(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3",
        },
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: `+=${window.innerHeight}`,
          scrub: 1,
        },
      });
      timeline
        .from(".left", {
          xPercent: -100,
        })
        .from(
          ".right",
          {
            xPercent: 100,
          },
          "<",
        )
        .from(
          ".left",
          {
            backgroundPositionX: "100%",
          },
          "<+=0.2",
        )
        .from(
          ".right",
          {
            backgroundPositionX: "-100%",
          },
          "<",
        );
    },
    { scope: container },
  );
  return (
    <h2
      ref={container}
      className=" section-title flex w-full justify-between text-[clamp(64px,14.375vw,368px)]"
    
    >
      <span className="left">Our</span>
      <span className="right">{sectionTitle}</span>
    </h2>
  );
};

export default SectionTitle;
