import React from "react";

const AboutEmptySection = () => {
  return (
    <section className="mt-[24rem] flex h-screen scale-x-125 flex-col gap-4">
      {[...new Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-full bg-brand-yellow"
          style={{
            height: `${(i + 1) * 0.8}rem`,
          }}
        ></div>
      ))}
      <div className="grid w-full flex-grow place-content-center bg-brand-yellow text-black">
        <p className="scale-x-75 font-sans text-[12.8rem] leading-none">
          So Have we grabbed your attention
        </p>
      </div>
    </section>
  );
};

export default AboutEmptySection;
