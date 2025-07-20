"use client";

// React
import { useEffect, useState, useRef } from "react";
// GSAP
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { horizontalLoop } from "@/utils";
// Dependencies
import { Transition } from "react-transition-group";

type LoadingManagerProps = {
  children: React.ReactNode;
  minLoadTime?: number;
};

const TRANSITION_DURATION = 300;
const LOADING_IMGS = [
  { src: "/images/loading/0.webp", rotationAngle: "0" },
  { src: "/images/loading/1.webp", rotationAngle: "6.15" },
  { src: "/images/loading/2.webp", rotationAngle: "-2.35" },
  { src: "/images/loading/3.webp", rotationAngle: "3.87" },
  { src: "/images/loading/4.webp", rotationAngle: "-6.19" },
  { src: "/images/loading/5.webp", rotationAngle: "-0.04" },
];

const transitionStyles = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 },
};

const animateCards = (
  cards: HTMLDivElement[],
  initialZIndex: number,
  contextSafe,
) => {
  let zIndex = initialZIndex;
  cards.forEach((card, i) => {
    zIndex++;
    gsap.set(card, {
      display: "block",
      rotationZ: LOADING_IMGS[i].rotationAngle,
      delay: (i + 1) / 4,
      zIndex,
      onComplete: () => {
        if (i === cards.length - 1) {
          contextSafe(() => {
            animateCards(cards, zIndex, contextSafe);
          });
        }
      },
    });
  });
};

const animateTitles = (rows: HTMLDivElement[]) => {
  rows.forEach((_, i) => {
    gsap.to(`.row-${i} .row-overlay`, {
      scaleY: 0,
      duration: 1.6,
      transformOrigin: "top",
      delay: i / 4,
      ease: "power3.out",
      onStart: function() {
        horizontalLoop(`.row-${i} .title`, {
          repeat: -1,
          speed: i + 1 - i / 2,
          reversed: i % 2 === 0,
        });
      },
    });
  });
};

const LoadingManager: React.FC<LoadingManagerProps> = ({
  children,
  minLoadTime = 1500,
}) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [imagesCount, setImagesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);
  const loadingStartTime = useRef(Date.now());
  const container = useRef(null);

  useGSAP(
    (_, contextSafe) => {
      const cards = gsap.utils.toArray<HTMLDivElement>(".card");
      const rows = gsap.utils.toArray<HTMLDivElement>("div[class^=row]");
      animateTitles(rows);
      animateCards(cards, 0, contextSafe);
    },
    { scope: container },
  );

  useEffect(() => {
    const handleImageLoad = () => setLoadedCount((prevCount) => prevCount + 1);

    const onPageLoad = () => {
      const images = document.querySelectorAll<HTMLImageElement>("img");
      setImagesCount(images.length);

      images.forEach((img) => {
        if (img.complete) {
          handleImageLoad();
        } else {
          img.addEventListener("load", handleImageLoad);
          img.addEventListener("error", handleImageLoad);
        }
      });
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
    }

    return () => {
      window.removeEventListener("load", onPageLoad);
      document.querySelectorAll("img").forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
        img.removeEventListener("error", handleImageLoad);
      });
    };
  }, []);

  useEffect(() => {
    const checkLoadingComplete = () => {
      const elapsedTime = Date.now() - loadingStartTime.current;
      if (
        loadedCount === imagesCount &&
        imagesCount > 0 &&
        elapsedTime > minLoadTime
      ) {
        setIsLoading(false);
        setTimeout(() => setIsAnimating(false), TRANSITION_DURATION);
      }
    };
    const interval = setInterval(checkLoadingComplete, 100);
    return () => clearInterval(interval);
  }, [loadedCount, imagesCount, minLoadTime]);

  return (
    <>
      {isAnimating && (
        <Transition
          mountOnEnter
          unmountOnExit
          nodeRef={container}
          timeout={TRANSITION_DURATION}
          in={isLoading}
        >
          {(state) => (
            <div
              ref={container}
              aria-label="loading"
              style={{
                transition: `opacity ${TRANSITION_DURATION}ms ease-in-out`,
                ...transitionStyles[state],
              }}
              className="fixed inset-0 z-topmost grid min-h-screen place-content-center bg-background"
            >
              <div className="flex flex-col whitespace-nowrap font-sans">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`row-${i} relative flex items-center gap-10`}
                  >
                    <span className="row-overlay absolute inset-0 z-content bg-background"></span>
                    {[...Array(12)].map((_, j) => (
                      <div key={j} className="title flex items-baseline gap-10">
                        <p className="text-[clamp(120px,14.375vw,368px)] leading-[100%]">
                          Aviation Club
                        </p>
                        <div className="w-[clamp(80px,9vw,230px)]">
                          <img
                            src="/logos/logo-small-white.svg"
                            alt="Aviation mini logo"
                            className="w-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="absolute-center z-popover">
                  {LOADING_IMGS.map((img) => (
                    <div
                      key={img.src}
                      className="card absolute-center hidden h-[clamp(200px,22.5vw,583px)] w-[clamp(143px,16vw,417px)] overflow-hidden rounded-[24px]"
                    >
                      <div className="absolute z-topmost h-full w-full bg-black opacity-20"></div>
                      <img
                        src={img.src}
                        alt="loading image"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Transition>
      )}
      {children}
    </>
  );
};

export default LoadingManager;
