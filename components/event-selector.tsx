import { EventType } from "@/types";
import { EVENTS } from "@/utils/constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type EventSelectorPropsType = {
  activeEvent: EventType;
  setActiveEvent: Function;
  setIsTransitioning: Function;
  setHoveredEventTitle: Function;
};

const EventSelector = ({
  activeEvent,
  setActiveEvent,
  setIsTransitioning,
  setHoveredEventTitle,
}: EventSelectorPropsType) => {
  const { contextSafe } = useGSAP();

  const handleNextEvent = function () {
    let nextEventIndex: number;
    const currentEventIndex = EVENTS.indexOf(activeEvent);
    if (currentEventIndex === EVENTS.length - 1) {
      nextEventIndex = 0;
    } else {
      nextEventIndex = currentEventIndex + 1;
    }
    setIsTransitioning(true);
    setActiveEvent(EVENTS[nextEventIndex]);
  };

  const handlePreviousEvent = function () {
    let nextEventIndex: number;
    const currentEventIndex = EVENTS.indexOf(activeEvent);
    if (currentEventIndex === 0) {
      nextEventIndex = EVENTS.length - 1;
    } else {
      nextEventIndex = currentEventIndex - 1;
    }
    setIsTransitioning(true);
    setActiveEvent(EVENTS[nextEventIndex]);
  };

  const handleEventClick = function (event: EventType) {
    if (event.title === activeEvent.title) return;
    setIsTransitioning(true);
    setActiveEvent(event);
  };

  const handleMouseHover = contextSafe(function ({
    isEntering,
    eventTitle,
  }: {
    isEntering: boolean;
    eventTitle: string;
  }) {
    setHoveredEventTitle(eventTitle);
    gsap.to(".message__event__text", {
      clipPath: isEntering ? "circle(150% at 0 0)" : "circle(0% at 0 0)",
    });
  });
  return (
    <div className="absolute bottom-[125rem] left-1/2 z-[-2] flex -translate-x-1/2 items-center justify-center gap-20 sm:bottom-[50rem] sm:gap-12 md:bottom-[40rem] lg:bottom-[30rem] xl:bottom-[3rem]">
      <button
        onClick={handlePreviousEvent}
        className="w-[12rem] rotate-180 sm:w-[max(3rem,30px)]"
        aria-label="Previous Event"
      >
        <img
          src="/svgs/arrow-2.svg"
          className="h-full w-full object-cover"
          alt="arrow pointing to the left"
        />
      </button>
      <ul className="flex items-center justify-center gap-16 sm:gap-6">
        {EVENTS.map((event) => (
          <li key={event.title}>
            <button
              onMouseEnter={() =>
                handleMouseHover({ isEntering: true, eventTitle: event.title })
              }
              onMouseLeave={() =>
                handleMouseHover({ isEntering: false, eventTitle: event.title })
              }
              onClick={() => handleEventClick(event)}
              className={`${activeEvent.title === event.title ? "opacity-100 ring-[0.4rem] ring-brand-yellow ring-offset-4 ring-offset-background" : "opacity-50"} event__button aspect-square w-[30rem] overflow-hidden rounded-full sm:w-[max(11rem,80px)]`}
            >
              <img
                src={event.images[event.images.length - 1].imgSrc}
                alt={event.title}
                className="event__button__image h-full w-full object-cover object-center"
              />
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={handleNextEvent}
        className="relative z-[20] w-[12rem] sm:w-[max(3rem,30px)]"
        aria-label="Next Event"
      >
        <img
          src="/svgs/arrow-2.svg"
          className="h-full w-full object-cover"
          alt="arrow pointing to the right"
        />
      </button>
    </div>
  );
};

export default EventSelector;
