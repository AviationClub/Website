import { cn } from "@/utils";
import React from "react";

type EventPropsType = {
  eventTitle: string;
  eventImgSrc: string;
  className?: string;
};

const HomeEvent = ({ eventTitle, eventImgSrc, className }: EventPropsType) => {
  return (
    <figure
      className={cn(
        "relative h-screen overflow-hidden rounded-[clamp(8px,1.25vw,32px)]",
        className,
      )}
    >
      <figcaption className="absolute-center peer z-modal cursor-pointer text-[min(10.3125vw,264px)]">
        {eventTitle}
      </figcaption>
      <div className="absolute inset-0 z-overlay bg-black opacity-50 transition duration-500 peer-hover:scale-110"></div>
      <img
        className="h-full w-full object-cover object-center transition duration-300 peer-hover:scale-110"
        src={eventImgSrc}
        alt={eventTitle}
      />
    </figure>
  );
};

export default HomeEvent;
