const IntroVideo = () => {
  return (
    <div
      id="intro-video"
      className="px-clamp absolute top-[calc(100vh-5.8vh)] z-base h-[82vh] w-full"
    >
      <div className="relative h-full w-full">
        <div className="pointer-events-none absolute inset-0 rounded-[clamp(8px,1.25vw,32px)] bg-black opacity-20"></div>
        <video
          autoPlay
          playsInline
          muted
          loop
          src="/videos/intro.mp4"
          className="h-full w-full rounded-[clamp(8px,1.25vw,32px)] object-cover object-center"
        />
      </div>
    </div>
  );
};

export default IntroVideo;
