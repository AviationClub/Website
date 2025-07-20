"use client";

// React
import { useRef } from "react";
import { cn } from "@/utils";
//GSAP
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

// Types
type style = "blue" | "yellow";
type BannerPropsType = {
  style: style;
};
type LogoPropsType = {
  style: style;
};

// Constants
const TITLES_COUNT = 3;

const Banner = ({ style }: BannerPropsType) => {
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
          scrub: 1,
          pinSpacing: false,
        },
      });
      timeline.to(".title-box", {
        xPercent: style === "blue" ? 50 : -50,
      });
    },
    {
      scope: container,
    },
  );

  // Styles
  const containerClasses = {
    "z-content origin-top-left rotate-6 bg-primary-dark": style === "blue",
    "origin-top-right -rotate-1 bg-brand-yellow": style === "yellow",
  };

  return (
    <div
      ref={container}
      className={cn(
        "relative flex w-[150%] gap-[clamp(8px,1.25vw,32px)]",
        containerClasses,
      )}
    >
      {[...new Array(TITLES_COUNT)].map((_, i) => (
        <div
          key={i}
          className="title-box flex items-center gap-[clamp(8px,1.25vw,32px)]"
        >
          <p
            className={cn("whitespace-nowrap text-[clamp(32px,5vw,128px)]", {
              "text-foreground": style === "blue",
              "text-black": style === "yellow",
            })}
          >
            We are not just a club we are
            <span
              className={cn({
                "text-brand-yellow": style === "blue",
                "text-primary-dark": style === "yellow",
              })}
            >
              {" "}
              the
            </span>{" "}
            club
          </p>
          <Logo style={style} />
        </div>
      ))}
    </div>
  );
};

function Logo({ style }: LogoPropsType) {
  return (
    <img
      src={
        style === "blue"
          ? "/logos/logo-small-white.svg"
          : "/logos/logo-small-black.svg"
      }
      alt="Aviation Logo"
      className="w-[clamp(32px,4.375vw,112px)]"
    />
  );
}

export default Banner;
