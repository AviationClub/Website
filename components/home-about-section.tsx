import React from "react";

//TODO THREEJS Image hover effect under the cursor

const HomeAboutSection = () => {
  return (
    <section className="relative">
      <p className="font-serif text-[clamp(32px,6.5625vw,168px)] uppercase leading-[120%]">
        <span className="flex justify-between">
          Based In <span className="font-bold text-brand-red">Abdo Pasha,</span>
        </span>
        <span className="relative ml-[15.2vw] font-bold text-brand-yellow">
          <img
            src="/svgs/ellipse.svg"
            alt="ellipse"
            className="absolute-center"
          />
          Aviation Club
        </span>
        <span className="flex justify-between">
          researches <span>aviation</span>
        </span>
        <span className="flex justify-between">
          technology, <span>aiming to</span>
        </span>
        <span className="flex justify-between">
          lead <span className="ml-[10.5vw]">globally </span> <span>and</span>
        </span>
        <span>
          impact <span className="ml-[15vw]">society</span>.
        </span>
      </p>
    </section>
  );
};

export default HomeAboutSection;
