import React from "react";

type EventDescriptionPropsType = {
  description: string;
};

const EventDescription = ({ description }: EventDescriptionPropsType) => {
  return (
    <div className="event__description pointer-events-none mt-[30rem] w-full max-w-full pl-0 text-center font-serif text-[max(16px,4.8rem)] leading-none sm:w-[76.6rem] sm:max-w-[76.6rem] sm:pl-[7rem] sm:text-left">
      {description.split("\n").map((line) => (
        <div key={line} className="overflow-hidden sm:first:pl-[12.7rem]">
          <p>{line}</p>
        </div>
      ))}
    </div>
  );
};

export default EventDescription;
