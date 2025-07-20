import React from "react";

type EventTitlePropsType = {
  title: string;
};

const EventTitle = ({ title }: EventTitlePropsType) => {
  return (
    <h2 className="event__title pointer-events-none font-sans text-[30rem] leading-none sm:text-[21.6rem]">
      {title.split("").map((char, i) => (
        <span className="char inline-block" key={i}>
          {char}
        </span>
      ))}
    </h2>
  );
};

export default EventTitle;
