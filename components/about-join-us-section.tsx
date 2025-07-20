import Button from "./ui/button";

const AboutJoinUsSection = () => {
  return (
    <section className="mt-[8rem] flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-[max(1.6rem,8px)] text-center">
        <h2 className="font-sans text-[max(16.8rem,32px)] leading-none">
          What Are You Waiting For?
          <br />
          Join Us and Shape the Future!
        </h2>
        <p className="max-w-full font-serif text-[max(4.8rem,16px)] sm:max-w-[106.2rem]">
          Inspired by our mission? Turn that spark into action. Join our journey
          and help shape the future. Your unique talents could be the key to our
          shared success. Ready to make a difference with us
        </p>
      </div>
      <Button className="w-[clamp(150px,19.5vw,500px)] py-1 font-sans text-[clamp(16px,2.5vw,64px)]">
        Join Us
      </Button>
    </section>
  );
};

export default AboutJoinUsSection;
