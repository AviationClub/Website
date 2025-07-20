import React from "react";
import Button from "./ui/button";
const HomeJoinUsSection = () => {
  return (
    <section className="flex flex-col items-center gap-[clamp(8px,0.9375vw,24px)]">
      <h2 className="text-center text-[clamp(32px,6.5625vw,168px)] leading-[100%]">
        Because your college
        <br />
        experience deserves a partner
      </h2>
      <p className="w-[clamp(320px,39vw,1000px)] text-center font-serif text-[clamp(12px,1.25vw,32px)]">
        Your college journey is more than just classes and exams. It&apos;s a
        time of growth, discovery, and unforgettable experiences. According to a
        study by the National Survey of Student Engagement (NSSE), students
        involved in extracurricular activities tend to have higher GPAs. So Join
        us to boost your college experience and potentially your academic
        performance.
      </p>
      <Button className="w-[clamp(150px,19.5vw,500px)] py-1 text-[clamp(16px,2.5vw,64px)]">
        Join Us
      </Button>
    </section>
  );
};

export default HomeJoinUsSection;
