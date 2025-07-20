"use client";

// React
import { useEffect, useRef, useState } from "react";
// GSAP
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { smoothEase } from "@/utils/custom-eases";
// Dependencies
import SplitType from "split-type";
// Components
import HamburgerButton from "./hamburger-button";
import NavCollageImages from "./nav-collage-images";
import NavLinks from "./nav-links";
import { NAV_LINKS, NAV_COLLAGE_IMGS } from "@/utils/constants";
import { usePathname } from "next/navigation";

// Constants
const BUTTON_ANIMATION_DURATION = 0.3;
const NAV_BUTTON_ANIMATION_DEFAULTS = {
  defaults: {
    duration: BUTTON_ANIMATION_DURATION,
    ease: "power3.out",
  },
  paused: true,
};
const IMAGE_INDEX_INIT = NAV_LINKS.map((link) => {
  return {
    href: link.href,
    index: 0,
  };
});
const MAX_IMAGE_NUM_LINK = NAV_COLLAGE_IMGS[0].images.length;

// Utils
const findCardElements = function(
  cards: HTMLDivElement[],
  linksVisible: HTMLAnchorElement,
) {
  return cards.filter((card) => card.dataset.path === linksVisible.pathname);
};

// Animations
const animateLinkChars = function(
  linkVisible: SplitType,
  linkHidden: SplitType,
): GSAPTimeline {
  return gsap
    .timeline({
      paused: true,
      defaults: {
        ease: smoothEase,
        duration: 0.4,
        stagger: 0.04,
        delay: 0.025,
      },
    })
    .to(linkVisible.chars, {
      yPercent: -100,
    })
    .from(
      linkHidden.chars,
      {
        yPercent: 100,
      },
      "<",
    );
};
const animateCardElements = function(
  cardElement: HTMLDivElement,
  cardOnTopZIndex: number,
) {
  gsap.set(cardElement, {
    zIndex: `${cardOnTopZIndex + 1}`,
  });
  gsap.fromTo(
    cardElement,
    {
      rotateZ: 0,
      scale: 0.8,
    },
    {
      rotateZ: Math.random() * 60 - 30,
      scale: 1,
      display: "inline-block",
    },
  );
};

const animateNavigation = function(): {
  buttonTimeline: GSAPTimeline;
  navTimeline: GSAPTimeline;
} {
  const buttonTimeline = gsap.timeline(NAV_BUTTON_ANIMATION_DEFAULTS);
  const navTimeline = gsap.timeline({
    paused: true,
  });

  buttonTimeline
    .to(
      ".first__bar",
      {
        rotateZ: -45,
        scaleX: 1,
        y: 0,
      },
      0,
    )
    .fromTo(
      ".second__bar",
      { scaleX: 1 },
      {
        scaleX: 0,
      },
      0,
    )
    .to(
      ".third__bar",
      {
        rotateZ: 45,
        scaleX: 1,
        y: 0,
      },
      0,
    );

  navTimeline
    .to([".yellow__bg", ".dark__blue__bg"], {
      yPercent: -100,
      duration: 0.6,
      stagger: 0.05,
      ease: smoothEase,
    })
    .to(
      "nav",
      {
        yPercent: -100,
        duration: 0.6,
        ease: smoothEase,
      },
      "<0.1",
    );
  return {
    buttonTimeline,
    navTimeline,
  };
};

const animateButtonOnMouseEnter = function() {
  const scaleFactor = 0.25;
  gsap
    .timeline({
      defaults: {
        duration: BUTTON_ANIMATION_DURATION,
        ease: smoothEase,
      },
    })
    .to(
      [".first__bar", ".third__bar"],
      {
        scaleX: 1 - scaleFactor,
      },
      0,
    )
    .to(
      ".second__bar",
      {
        scaleX: 1 + scaleFactor,
      },
      0,
    );
};

const Nav = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [previousLink, setPreviousLink] = useState<string | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const imageIndexes = useRef(IMAGE_INDEX_INIT);
  const navButtonAnimationTimeline = useRef(gsap.timeline());
  const navAnimationTimeline = useRef(gsap.timeline());
  const pathname = usePathname();

  const { contextSafe } = useGSAP(
    function(_, contextSafe) {
      const linksWrapper = gsap.utils.toArray<HTMLElement>(".links__wrapper");
      const linksVisible =
        gsap.utils.toArray<HTMLAnchorElement>(".link__visible");
      const linksHidden =
        gsap.utils.toArray<HTMLAnchorElement>(".link__hidden");
      const cardElements = gsap.utils.toArray<HTMLDivElement>(".collage__card");
      let cardOnTopZIndex = 0;
      let handleMouseEnter: () => void;
      let handleMouseLeave: () => void;

      // Display first Card Element
      const firstVisibleLink = linksVisible.find(
        (link) => link.pathname === pathname,
      );
      const imageIndex = imageIndexes.current.find(
        (imageIndex) => imageIndex.href === pathname,
      );
      if (firstVisibleLink && imageIndex && imageIndex.index < 1) {
        const cardElement = findCardElements(cardElements, firstVisibleLink);
        gsap.set(cardElement[0], {
          display: "inline-block",
        });
        imageIndex.index = 1;
      }

      for (let i = 0; i < linksVisible.length; i++) {
        const linkVisible = new SplitType(linksVisible[i], { types: "chars" });
        const linkHidden = new SplitType(linksHidden[i], { types: "chars" });
        const timeline = animateLinkChars(linkVisible, linkHidden);

        if (!contextSafe) return;

        handleMouseEnter = contextSafe(function() {
          timeline.play();

          const cardElement = findCardElements(cardElements, linksVisible[i]);
          if (!cardElement) return;

          // Card Animations
          const imageIndex = imageIndexes.current.find(
            (imageIndex) => imageIndex.href === linksVisible[i].pathname,
          );
          if (imageIndex) {
            animateCardElements(cardElement[imageIndex.index], cardOnTopZIndex);
            imageIndex.index = (imageIndex?.index + 1) % MAX_IMAGE_NUM_LINK;
          }
          cardOnTopZIndex++;
        });

        handleMouseLeave = function() {
          timeline.reverse();
        };

        linksWrapper[i].addEventListener("mouseenter", handleMouseEnter);
        linksWrapper[i].addEventListener("mouseleave", handleMouseLeave);
      }
      const navTimelines = animateNavigation();
      navButtonAnimationTimeline.current = navTimelines.buttonTimeline;
      navAnimationTimeline.current = navTimelines.navTimeline;

      return function() {
        linksWrapper.forEach((linkWrapper) => {
          linkWrapper.removeEventListener("mouseenter", handleMouseEnter);
          linkWrapper.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    },
    { scope: container },
  );
  const animateButtonOnMouseLeave = contextSafe(function() {
    gsap.to(".bar", {
      scaleX: 1,
      duration: BUTTON_ANIMATION_DURATION,
    });
  });

  // Nav Button Hover Event Handler
  const handleMouseButtonEnter = contextSafe(function() {
    if (isNavOpen) return;
    animateButtonOnMouseEnter();
  });
  const handleMouseButtonLeave = contextSafe(function() {
    if (isNavOpen) return;
    animateButtonOnMouseLeave();
  });

  // Nav Button Open/Close Event Handlers
  const handleButtonClick = function() {
    if (!isNavOpen) {
      setPreviousLink(null);
    }
    setIsNavOpen((isNavOpen) => !isNavOpen);
  };

  // Nav Links Event Handlers
  const handleLinkClick = contextSafe(function() {
    setIsNavOpen(false);
    setPreviousLink(pathname);
    navAnimationTimeline.current.timeScale(0.6);
  });

  // Effects
  useEffect(() => {
    if (isNavOpen) {
      navButtonAnimationTimeline.current.play();
      navAnimationTimeline.current.play().timeScale(1);
    } else {
      navButtonAnimationTimeline.current.reverse().then(() => {
        animateButtonOnMouseLeave();
      });
      navAnimationTimeline.current.reverse();
    }
  }, [isNavOpen, animateButtonOnMouseLeave]);

  // JSX
  return (
    <div ref={container} className="px-clamp relative">
      <HamburgerButton
        onMouseEnter={handleMouseButtonEnter}
        onMouseLeave={handleMouseButtonLeave}
        onClick={handleButtonClick}
      />
      <div className="yellow__bg fixed inset-0 translate-y-full bg-brand-yellow"></div>
      <div className="dark__blue__bg fixed inset-0 translate-y-full bg-primary-dark"></div>
      <nav className="fixed inset-0 z-0 flex translate-y-full items-center justify-center gap-16 overflow-hidden bg-background pl-[calc(100vw-100%)] text-[max(80px,27rem)]">
        <div className="relative z-base hidden h-full w-[120rem] sm:block">
          <NavCollageImages />
        </div>
        <ul className="flex flex-col items-center gap-2 leading-[85%] sm:items-start">
          <NavLinks onClick={handleLinkClick} previousLink={previousLink} />
        </ul>
      </nav>
    </div>
  );
};

export default Nav;
