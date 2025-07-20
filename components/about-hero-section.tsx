const AboutHeroSection = () => {
  return (
    <section className="section-1 relative z-0 min-h-screen place-content-center">
      <div>
        <h1 className="flex flex-col items-start font-serif text-[max(21.6rem,60px)]">
          <span className="ml-[-3.6rem] mt-[4rem] p-0 sm:ml-[21.4rem]">
            who
          </span>
          <span className="ml-[168.8rem] mt-[25.5rem] p-0">we</span>
          <span className="ml-[-1rem] mt-[-23.6rem] p-0 sm:ml-[62.4rem]">
            are
          </span>
        </h1>
        <div className="absolute left-1/2 top-1/2 z-[-1] aspect-[calc(80.6/185)] w-[max(80.6rem,300px)] -translate-x-1/2 -translate-y-1/2 sm:aspect-[calc(80.6/103.8)]">
          <img
            src="/images/about-us.jpg"
            className="h-full w-full rounded-[max(2.4rem,16px)] object-cover"
            alt="Aviation Members from juniors event"
          />
        </div>
      </div>
      <div className="mt-[-18.4rem] flex justify-end">
        <div className="flex items-end gap-4">
          <div className="h-[95%] w-[4px] origin-top animate-shrink-grow bg-white"></div>
          <p className="text-left font-sans text-[max(12.8rem,40px)] leading-none">
            Scroll to <br />
            figure out
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
