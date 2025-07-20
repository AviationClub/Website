import React from "react";

type HamburgerButtonPropsType = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  onMouseEnter: React.MouseEventHandler<HTMLButtonElement>;
  onMouseLeave: React.MouseEventHandler<HTMLButtonElement>;
};

const HamburgerButton = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
}: HamburgerButtonPropsType) => {
  return (
    <button
      className="hamburger absolute left-1/2 top-1/2 z-content flex h-[max(8rem,48px)] w-[max(8rem,48px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-[4px] rounded-full bg-white text-5xl"
      aria-label="Open Navigation"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="first__bar bar absolute h-[2px] w-[35%] -translate-y-[5px] rounded-full bg-black"></div>
      <div className="second__bar bar absolute h-[2px] w-[35%] rounded-full bg-black"></div>
      <div className="third__bar bar absolute h-[2px] w-[35%] translate-y-[5px] rounded-full bg-black"></div>
    </button>
  );
};

export default HamburgerButton;
