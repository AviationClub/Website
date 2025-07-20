import React from "react";
import Button from "./ui/button";
import { MouseEventHandler } from "react";

type EventExitButtonPropsType = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  isExpanded: boolean;
};

const EventExitButton = ({ onClick, isExpanded }: EventExitButtonPropsType) => {
  return (
    <Button
      onClick={onClick}
      className="button__exit absolute bottom-[64px] left-1/2 w-[max(22rem,80px)] -translate-x-1/2 translate-y-[300%] border-black bg-brand-yellow px-20 pb-5 pt-7 font-sans text-[max(4.8rem,16px)] leading-none tracking-wide text-black opacity-0"
    >
      {isExpanded ? "Close" : "Exit"}
    </Button>
  );
};

export default EventExitButton;
