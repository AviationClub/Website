import React from "react";

type EventPopupMessagePropsType = {
  hoveredEventTitle: string;
};

const EventPopupMessage = ({
  hoveredEventTitle,
}: EventPopupMessagePropsType) => {
  return (
    <>
      <div
        className="message__event__text absolute inset-0 z-10 flex items-center gap-4 rounded-2xl bg-white p-2 px-4"
        style={{
          clipPath: "circle(0% at 0 0)",
        }}
      >
        <img src="/svgs/ticket.svg" alt="A drag icon" />
        <p
          className="pt-4 font-sans text-[6.4rem]"
          style={{
            WebkitTextStroke: "1px black",
            WebkitTextFillColor: "transparent",
          }}
        >
          {hoveredEventTitle}
        </p>
      </div>
      <div
        className="message__drag__text absolute inset-0 z-10 flex items-center gap-4 rounded-2xl bg-background p-2 px-4"
        style={{
          clipPath: "circle(0% at 0 0)",
        }}
      >
        <img src="/svgs/drag.svg" alt="A drag icon" />
        <p
          className="pt-4 font-sans text-[6.4rem]"
          style={{
            WebkitTextStroke: "1px white",
            WebkitTextFillColor: "transparent",
          }}
        >
          Drag to move
        </p>
      </div>
      <div
        className="message__expand__text absolute inset-0 z-10 flex items-center gap-4 rounded-2xl bg-white p-2 px-4"
        style={{
          clipPath: "circle(0% at 0 0)",
        }}
      >
        <img src="/svgs/expand.svg" alt="A drag icon" />
        <p
          className="pt-4 font-sans text-[6.4rem]"
          style={{
            WebkitTextStroke: "1px black",
            WebkitTextFillColor: "transparent",
          }}
        >
          Click to expand
        </p>
      </div>
      <div className="flex items-center gap-4 rounded-2xl bg-brand-yellow p-2 px-4">
        <img
          src="/svgs/star.svg"
          alt="A star icon"
          className="animate-spin-slow"
        />
        <p
          className="pt-4 font-sans text-[6.4rem]"
          style={{
            WebkitTextStroke: "1px black",
            WebkitTextFillColor: "transparent",
          }}
        >
          Click to explore
        </p>
      </div>
    </>
  );
};

export default EventPopupMessage;
