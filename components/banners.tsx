import React from "react";
import Banner from "./banner";

const Banners = () => {
  return (
    <div className="relative grid h-[clamp(150px,22vw,446px)] place-content-start justify-center">
      <Banner style="blue" />
      <Banner style="yellow" />
    </div>
  );
};

export default Banners;
