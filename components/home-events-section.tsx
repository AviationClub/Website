"use client";
import React, { useRef } from "react";
import Event from "./home-event";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

const EVENTS = [
  { title: "Robolympics", imgSrc: "/images/robolympics.webp" },
  { title: "Juniors", imgSrc: "/images/juniors.webp" },
  { title: "Academy", imgSrc: "/images/academy.webp" },
];

const HomeEventsSection = () => {
  const container = useRef(null);
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const timeline = gsap.timeline({
        defaults: {
          ease: "none",
        },
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: `+=${window.innerHeight * 4}`,
          anticipatePin: 1,
          scrub: 1,
          pin: true,
        },
      });

      timeline
        .to(".event-0", {
          scale: 0.5,
          filter: "blur(3px)",
        })
        .to(
          [".event-1", ".event-2"],
          {
            yPercent: -100,
          },
          "<",
        )
        .to(".event-1", {
          scale: 0.5,
          filter: "blur(3px)",
        })
        .to(
          ".event-2",
          {
            yPercent: -200,
          },
          "<",
        )
        .to(".event-2", {
          scale: 0.9,
          duration: 0.2,
        });
    },
    { scope: container },
  );

  return (
    <section ref={container} className="max-h-screen overflow-hidden">
      {EVENTS.map((event, i) => (
        <Event
          key={event.title}
          eventTitle={event.title}
          eventImgSrc={event.imgSrc}
          className={`event-${i}`}
        />
      ))}
    </section>
  );
};

export default HomeEventsSection;
