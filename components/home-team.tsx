"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { horizontalLoop } from "@/utils";

type TeamPropsType = {
  teamTitle: string;
  teamImgSrc: string;
  speed?: number;
  reversed?: boolean;
};
const HomeTeam = ({
  teamTitle,
  teamImgSrc,
  speed,
  reversed = false,
}: TeamPropsType) => {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      const titles = gsap.utils.toArray(".title-box");
      const loop = horizontalLoop(titles, {
        speed,
        repeat: -1,
        paddingRight: "1.25vw",
        reversed,
      });

      // const imgAnimation = gsap.to(".img-box", {
      //   yPercent: -150,
      //   paused: true,
      // });
      //
      // container.current.addEventListener("mouseenter", () => {
      //   const isReversed = loop.reversed();
      //   loop.timeScale(0.5);
      //   if (isReversed) loop.reverse();
      //   imgAnimation.play();
      // });
      // container.current.addEventListener("mouseleave", () => {
      //   const isReversed = loop.reversed();
      //   loop.timeScale(1);
      //   if (isReversed) loop.reverse();
      //   imgAnimation.reverse();
      // });
      // return () => {
      //   if (!container.current) return;
      //   container.current.removeEventListener("mouseenter", () => { });
      //   container.current.removeEventListener("mouseleave", () => { });
      // };
    },
    {
      scope: container,
    },
  );
  return (
    <figure
      ref={container}
      className="relative w-[120%] cursor-pointer overflow-hidden"
    >
      {/* <div className="img-box absolute inset-0 left-1/2 top-1/2 h-full w-full -translate-x-1/2 translate-y-[100%]"> */}
      {/*   <div className="absolute-center h-full w-full bg-black opacity-50"></div> */}
      {/*   <img */}
      {/*     className="absolute-center z-[-1] h-full w-full object-cover object-center" */}
      {/*     src={teamImgSrc} */}
      {/*     alt={teamTitle} */}
      {/*   /> */}
      {/* </div> */}
      <div className="flex justify-center gap-[clamp(8px,1.25vw,32px)] border-b-2 border-b-white">
        {new Array(12).fill(0).map((_, i) => (
          <div key={i} className="title-box flex gap-[clamp(8px,1.25vw,32px)]">
            <h3
              key={i}
              className="whitespace-nowrap text-[clamp(32px,5vw,128px)]"
            >
              {teamTitle}
            </h3>
            <span className="whitespace-nowrap text-[clamp(32px,5vw,128px)]">
              -
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
};

export default HomeTeam;
