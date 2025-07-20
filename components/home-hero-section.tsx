"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import IntroVideo from "./intro-video";
import { useRef } from "react";

// Clean those animations and fix mobile issues

const COLLAGE_IMAGES_SRCS = [
  "/images/collage/arcade-01.png",
  "/images/collage/camera-06.png",
  "/images/collage/computer-01.png",
  "/images/collage/computer-09.png",
  "/images/collage/hands-03.png",
  "/images/collage/joystick-01.png",
  "/images/collage/joystick-03.png",
  "/images/collage/passport-01.png",
  "/images/collage/stereo-01.png",
  "/images/collage/vhs-01.png",
  "/images/collage/videogame-08.png",
];

const MAX_MOUSE_MOVE_DISTANCE = 60;
const MIN_IMG_WIDTH = 300;

interface ImgState {
  element: HTMLImageElement;
  quickSetter: Function;
  loaded: boolean;
}

const createImgStates = function (): ImgState[] {
  return COLLAGE_IMAGES_SRCS.map((src) => {
    const img = new Image(Math.max(MIN_IMG_WIDTH, window.innerWidth * 0.15625));
    img.src = src;
    const imgState = {
      element: img,
      quickSetter: gsap.quickSetter(img, "css"),
      loaded: false,
    };
    img.addEventListener("load", function () {
      imgState.loaded = true;
    });
    return imgState;
  });
};

const hasMovedEnough = function (
  prev: { x: number; y: number },
  current: { x: number; y: number },
): boolean {
  const deltaX = current.x - prev.x;
  const deltaY = current.y - prev.y;
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  return distance >= MAX_MOUSE_MOVE_DISTANCE;
};

const updateImgPosition = function (
  imgStates: ImgState,
  position: { x: number; y: number },
  zIndex: number,
) {
  imgStates.quickSetter({
    position: "absolute",
    left: position.x,
    top: position.y,
    x: "-50%",
    y: "-50%",
    zIndex,
  });
};
const HomeHeroSection = () => {
  const collageContainer = useRef<HTMLDivElement | null>(null);
  const section = useRef<HTMLDivElement | null>(null);
  useGSAP(
    (_, contextSafe) => {
      if (!section.current || !collageContainer.current || !contextSafe) return;
      const imgStates = createImgStates();
      let prevPosition: {
        x: number;
        y: number;
      } | null = null;
      let index = 0;
      const imgsAdded: HTMLImageElement[] = [];

      const handleMouseMove = contextSafe((e: MouseEvent) => {
        const imgIndex = index % COLLAGE_IMAGES_SRCS.length;
        if (!imgStates[imgIndex].loaded) {
          index++;
          return;
        }
        const currentPosition = {
          x: e.clientX + window.scrollX,
          y: e.clientY + window.scrollY,
        };
        if (prevPosition && !hasMovedEnough(currentPosition, prevPosition)) {
          return;
        }
        prevPosition = currentPosition;

        if (imgsAdded[imgIndex]?.src !== imgStates[imgIndex].element.src) {
          collageContainer.current?.appendChild(imgStates[imgIndex].element);
          imgsAdded.push(imgStates[imgIndex].element);
        }
        updateImgPosition(imgStates[imgIndex], currentPosition, index);
        index++;
      });

      section.current.addEventListener("mousemove", handleMouseMove);
      return () => {
        section.current?.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: collageContainer },
  );

  return (
    <section className="flex items-center justify-center gap-[1.5625vw]">
      <div
        ref={section}
        className="relative grid min-h-screen w-full place-content-center"
      >
        <div
          ref={collageContainer}
          className="absolute-center z-hidden h-screen w-screen overflow-hidden"
        ></div>
        <div className="flex flex-col items-center justify-center gap-[0.9375vw]">
          <h1 className="text-center font-sans text-[clamp(48px,7.5vw,192px)] leading-[0.8] text-foreground">
            Aviation Club
            <br />
            College experience that flies
          </h1>
          <p className="w-full text-center font-serif text-[clamp(12px,1.25vw,32px)]">
            Aviation Club is a Student-to-Student Organization,
            <br />
            based in Faculty of Engineering Ain-shams University.
            <br />
            Our Scope is to cover practical, theoretical
            <br />
            training and research abilities in Aviation field.
          </p>
        </div>
      </div>
      <IntroVideo />
    </section>
  );
};

export default HomeHeroSection;
