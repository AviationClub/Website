import { twMerge } from "tailwind-merge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

type AboutSectiosPropsType = {
  title: string;
  descriptionBefore: string;
  descriptionAfter: string;
  inBetweenWord: string;
  imgSrc: string;
  className?: string;
  sectionNumber: number;
};

gsap.registerPlugin(ScrollTrigger);

const AboutSection = ({
  title,
  descriptionBefore,
  descriptionAfter,
  inBetweenWord,
  imgSrc,
  className,
  sectionNumber,
}: AboutSectiosPropsType) => {
  return (
    <section
      className={twMerge(
        "flex h-auto flex-col justify-between gap-16 text-center sm:h-[143.2rem] sm:flex-row sm:text-left",
        className,
      )}
    >
      <div
        className={`left-${sectionNumber} flex h-full w-auto flex-col gap-8 sm:w-[90rem]`}
      >
        <h2 className="font-sans text-[52.8rem] leading-[85%]">{title}</h2>
        <p className="text-center font-serif text-[7rem] sm:text-justify">
          {descriptionBefore}
        </p>

        <div className="relative grid h-[21.3rem] place-content-center rounded-2xl border-[1px] border-white font-serif">
          <span></span>
          <p className="text-[9.6rem]">{inBetweenWord}</p>
          <span></span>
        </div>
        <p className="text-center font-serif text-[7rem] sm:text-justify">
          {descriptionAfter}
        </p>
      </div>
      <div
        className={`right-${sectionNumber} relative z-[${sectionNumber}] h-full w-full sm:w-[140rem]`}
      >
        <img
          src={imgSrc}
          className="h-full w-full rounded-[2.4rem] object-cover"
          alt={title}
        />
      </div>
    </section>
  );
};

export default AboutSection;
