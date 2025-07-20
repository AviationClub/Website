"use client";
// Refactor expanded open and close into one function

// Deal with inital mouse click issue

// React
import { useState, useRef, useEffect } from "react";
// GSAP
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
// Types
import { EventType } from "@/types";
// Components
import EventTitle from "./event-title";
import EventDescription from "./event-description";
import EventImageList from "./event-image-list";
import EventExitButton from "./event-exit-button";
import EventPopupMessage from "./event-popup-message";

import { EVENTS } from "@/utils/constants";
import EventSelector from "./event-selector";

// Constants
const INIT_POS = { x: 0, y: 0 };
const NEW_BACKGROUND_DRAG_POS_SPEED = 200;
const NEW_BACKGROUND_FLOAT_POS_SPEED = 10;
const NEW_CARD_POS_SPEED = 100;
const MAX_OFFSET = 3000;

const Event = () => {
  const [activeEvent, setActiveEvent] = useState(EVENTS[0]);
  const [hoveredEventTitle, setHoveredEventTitle] = useState(EVENTS[0].title);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState(activeEvent.title);
  const [description, setDescription] = useState(activeEvent.description);
  const [images, setImages] = useState(activeEvent.images);
  const [messageVisible, setMessageVisible] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [mouseInitialPosition, setMouseInitialPosition] = useState(INIT_POS);
  const [offset, setOffset] = useState(INIT_POS);
  const [backgroundPosition, setBackgroundPosition] = useState(INIT_POS);
  const [isDragging, setIsDragging] = useState(false);

  const windowWidth = useRef<number | null>(null);
  const container = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const message = useRef<HTMLDivElement>(null);
  const messageShowTween = useRef<GSAPTween | null>(null);
  const expandedImage = useRef<HTMLElement | null>(null);
  const expandedImageOldPosition = useRef({
    transform: "",
    top: "",
    left: "",
  });
  const xTo = useRef(gsap.quickSetter(message.current, "x"));
  const yTo = useRef(gsap.quickSetter(message.current, "y"));
  const transitionTimeline = useRef(gsap.timeline());

  const { contextSafe } = useGSAP({ scope: container });

  /**
  Handle Message Animations
  **/
  const handleMessageAnimations = function (e: React.MouseEvent<HTMLElement>) {
    if (!container.current) return;
    // Message
    xTo.current(e.clientX);
    yTo.current(e.clientY + window.scrollY - container.current?.offsetTop);

    setMessageVisible(
      e.target instanceof HTMLElement &&
        (e.target.classList.contains("card") ||
          e.target.classList.contains("event__button__image")),
    );
  };

  /**
  Transition Animations
  **/
  const handleTransitionAnimations = contextSafe(function (
    activeEvent: EventType,
  ) {
    transitionTimeline.current.kill();
    const timeline = gsap.timeline();
    timeline
      .to(".event__title .char", {
        yPercent: 100,
        opacity: 0,
        duration: 0.2,
        stagger: 0.02,
      })
      .to(
        ".event__description p",
        {
          yPercent: 100,
          opacity: 0,
          duration: 0.3,
          stagger: 0.03,
        },
        "<",
      )
      .to(
        ".card",
        {
          y: "-100%",
          opacity: 0,
          duration: 0.4,
          stagger: 0.04,
        },
        "<",
      )
      .then(function () {
        setTitle(activeEvent.title);
        setDescription(activeEvent.description);
        setImages(activeEvent.images);
        setIsTransitioning(false);
      });
    return timeline;
  });

  const handleTitleAnimations = function ({
    isEntering,
    title,
    onComplete,
  }: {
    isEntering: boolean;
    title: HTMLSpanElement[];
    onComplete?: (...args: any[]) => void;
  }) {
    gsap.to(title.toReversed(), {
      yPercent: isEntering ? 100 : 0,
      opacity: isEntering ? 0 : 1,
      duration: 0.6,
      stagger: 0.05,
      ease: "power3.out",
      onComplete,
    });
  };

  const handleDescriptionAnimations = function ({
    isEntering,
    description,
  }: {
    isEntering: boolean;
    description: HTMLParagraphElement[];
  }) {
    gsap.to(description.toReversed(), {
      y: isEntering ? 100 : 0,
      opacity: isEntering ? 0 : 1,
      duration: 1.4,
      stagger: 0.12,
      ease: "power2.out",
    });
  };

  /**
Handle Mouse Movement
**/
  const handleMouseMove = contextSafe(function (
    e: React.MouseEvent<HTMLElement>,
  ) {
    if (!message.current) return;

    if (isDragging && canvasVisible && !isExpanded) {
      const newOffsetX = Math.max(
        Math.min(MAX_OFFSET, e.clientX - mouseInitialPosition.x),
        -MAX_OFFSET,
      );
      const newOffsetY = Math.max(
        Math.min(MAX_OFFSET, e.clientY - mouseInitialPosition.y),
        -MAX_OFFSET,
      );

      const newBackgroundPosition = {
        x: (newOffsetX / window.innerWidth) * NEW_BACKGROUND_DRAG_POS_SPEED,
        y: (newOffsetY / window.innerHeight) * NEW_BACKGROUND_DRAG_POS_SPEED,
      };

      gsap.to(canvas.current, {
        backgroundPosition: `${newBackgroundPosition.x}vmin ${newBackgroundPosition.y}vmin`,
        duration: 1,
      });

      const cardNewPosition = {
        x: (newOffsetX / window.innerWidth) * NEW_CARD_POS_SPEED,
        y: (newOffsetY / window.innerHeight) * NEW_CARD_POS_SPEED,
      };
      gsap.to(".card", {
        x: `${cardNewPosition.x}vmin`,
        y: `${cardNewPosition.y}vmin`,
      });

      setOffset({
        x: newOffsetX,
        y: newOffsetY,
      });

      setBackgroundPosition(newBackgroundPosition);
    } else {
      gsap.to(canvas.current, {
        backgroundPosition: `${(e.clientX / window.innerWidth - 0.5) * NEW_BACKGROUND_FLOAT_POS_SPEED + backgroundPosition.x}vmin ${(e.clientY / window.innerHeight - 0.5) * NEW_BACKGROUND_FLOAT_POS_SPEED + backgroundPosition.y}vmin`,
        duration: 1,
      });
    }
    handleMessageAnimations(e);
  });

  /*
Handle Canvas Enter and Exit Animations 
*/
  const handleEnterExitAnimations = contextSafe(function (isEntering: boolean) {
    const cards = gsap.utils.toArray<HTMLDivElement>(".card");
    const title = gsap.utils.toArray<HTMLDivElement>(".event__title .char");
    const description = gsap.utils.toArray<HTMLParagraphElement>(
      ".event__description p",
    );

    // Card animations
    cards.forEach((card, i) => {
      const left = activeEvent.images[i].left;
      const top = activeEvent.images[i].top;
      gsap.to(card, {
        left: isEntering ? `${left}rem` : "50%",
        top: isEntering ? `${top}rem` : "50%",
        y: isEntering ? 0 : "-50%",
        x: isEntering ? 0 : "-50%",
        duration: 1.2,
        ease: isEntering ? "power3.in" : "power3.out",
      });
    });

    // Title animations
    handleTitleAnimations({ isEntering, title });

    // Description animations,
    handleDescriptionAnimations({ isEntering, description });

    // Message drag text animations
    gsap.to(".message__drag__text", {
      clipPath: isEntering ? "circle(150% at 0 0)" : "circle(0% at 0 0)",
    });

    // Exit button animations
    gsap.to(".button__exit", {
      y: isEntering ? 0 : "300%",
      opacity: isEntering ? "1" : "0",
      duration: 0.4,
      ease: "power3.out",
    });

    // Canvas animations
    gsap.to(".canvas__child", {
      y: isEntering ? "-200vh" : "0",
      duration: 1.6,
      stagger: 0.05,
      ease: isEntering ? "power3.out" : "power3.in",
    });

    gsap.to(canvas.current, {
      y: isEntering ? "0" : "200vh",
      duration: 1.6,
      ease: isEntering ? "power3.out" : "power3.in",
    });
    setCanvasVisible(isEntering);
  });

  const handleClick = function (e: React.MouseEvent) {
    if (!messageVisible || isDragging) return;
    if (canvasVisible) {
      expandedImage.current = e.target as HTMLElement;
      const parent = expandedImage.current.closest("div");
      expandedImageOldPosition.current = {
        transform: expandedImage.current.style.transform,
        top: expandedImage.current.style.top,
        left: expandedImage.current.style.left,
      };
      gsap.set(parent, {
        position: "fixed",
        inset: "0",
        background: "rgba(0,0,0,0.5)",
      });
      gsap.to(e.target, {
        position: "fixed",
        scale: 1.2,
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
      });
      setIsExpanded(true);
      setMessageVisible(false);
    } else {
      if (container.current) {
        container.current.style.zIndex = "999999";
      }
      gsap.set(".layout__wrapper", {
        height: "100vh",
      });
      handleEnterExitAnimations(true);
    }
  };

  const handleExitClick = function () {
    if (isExpanded && expandedImage.current) {
      const parent = expandedImage.current?.closest("div");
      gsap.set(parent, {
        position: "static",
        background: "none",
      });
      gsap.to(expandedImage.current, {
        position: "absolute",
        scale: 1,
        transform: expandedImageOldPosition.current.transform,
        top: expandedImageOldPosition.current.top,
        left: expandedImageOldPosition.current.left,
      });
      setIsExpanded(false);
      setMessageVisible(true);
    } else {
      setTimeout(function () {
        if (container.current) {
          container.current.style.zIndex = "9999";
          gsap.set(".layout__wrapper", {
            height: "auto",
          });
        }
      }, 700);

      setBackgroundPosition(INIT_POS);
      setOffset(INIT_POS);
      handleEnterExitAnimations(false);
    }
  };

  /*
Handle Mouse Down and Up
*/
  const handleMouseDown = function (e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
    if (e.target instanceof HTMLImageElement) return;
    setIsDragging(true);
    setMouseInitialPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };
  const handleMouseUp = function () {
    setIsDragging(false);
  };

  useEffect(() => {
    xTo.current = gsap.quickTo(message.current, "x", { duration: 0.15 });
    yTo.current = gsap.quickTo(message.current, "y", { duration: 0.15 });

    if (messageVisible && !isExpanded) {
      messageShowTween.current = gsap.to(message.current, {
        scale: 1,
        duration: 1.2,
        ease: "elastic.out(1,0.4)",
      });
    } else if ((!messageVisible && !canvasVisible) || isExpanded) {
      if (messageShowTween.current) {
        messageShowTween.current.kill();
      }
      gsap.to(message.current, {
        scale: 0,
        duration: 0.6,
        ease: "power3.out",
        transformOrigin: "top left",
      });
    }
  }, [messageVisible, canvasVisible, isExpanded]);

  useEffect(() => {
    if (!isTransitioning) return;
    transitionTimeline.current = handleTransitionAnimations(activeEvent);
  }, [activeEvent, isTransitioning, handleTransitionAnimations]);

  useEffect(() => {
    const animateTitles = contextSafe(function () {
      gsap.fromTo(
        ".event__title .char",
        {
          yPercent: 100,
          opacity: 0,
          duration: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.2,
          stagger: 0.02,
        },
      );
    });
    animateTitles();
  }, [title, contextSafe]);

  useEffect(() => {
    const animateDescription = contextSafe(function () {
      gsap.fromTo(
        ".event__description p",
        {
          yPercent: 100,
          opacity: 0,
          duration: 0,
        },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.03,
        },
      );
    });
    animateDescription();
  }, [description, contextSafe]);

  useEffect(() => {
    const animateImages = contextSafe(function () {
      gsap.fromTo(
        ".card",
        {
          y: "-100%",
          x: "-50%",
          opacity: 0,
          duration: 0,
        },
        {
          y: "-50%",
          opacity: 1,
          duration: 0.4,
          stagger: 0.04,
        },
      );
    });
    animateImages();
  }, [images, contextSafe]);

  useEffect(() => {
    if (window) {
      windowWidth.current = window.innerWidth;
    }
  }, []);

  // Touch Devices
  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    setIsDragging(true);
    setMouseInitialPosition({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    e.preventDefault();
    handleMouseMove(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <article
      className={`px-clamp relative z-0 flex h-screen flex-col items-center justify-between py-[38vh] sm:flex-row sm:py-0 sm:pb-[7rem]`}
      onMouseDown={handleMouseDown}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      ref={container}
    >
      <div className="overflow-hidden">
        <EventTitle title={title} />
      </div>
      <div className="absolute inset-0 z-hidden h-screen w-full">
        <div
          ref={message}
          className="message pointer-events-none absolute z-10 scale-0 overflow-hidden"
        >
          {windowWidth.current && windowWidth.current > 600 && (
            <EventPopupMessage hoveredEventTitle={hoveredEventTitle} />
          )}
        </div>
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            ref={canvas}
            className={`absolute inset-0 z-hidden h-[200vh] w-[200vw] translate-y-[200vh] overflow-hidden bg-sky ${canvasVisible ? "cursor-move" : "cursor-auto"}`}
          >
            <div className="canvas__child absolute inset-0 h-full w-full bg-brand-yellow"></div>
          </div>
          <EventImageList
            title={title}
            images={images}
            onClick={handleClick}
            messageVisible={messageVisible}
            canvasVisible={canvasVisible}
          />
          <EventExitButton onClick={handleExitClick} isExpanded={isExpanded} />
          <div>
            <EventSelector
              setHoveredEventTitle={setHoveredEventTitle}
              setIsTransitioning={setIsTransitioning}
              setActiveEvent={setActiveEvent}
              activeEvent={activeEvent}
            />
          </div>
        </div>
      </div>
      <EventDescription description={description} />
    </article>
  );
};

export default Event;
