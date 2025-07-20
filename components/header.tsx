import React from "react";
import Logo from "./logo";
import Nav from "./nav";

const Header = () => {
  return (
    <header className="px-clamp fixed top-0 z-[999999] flex w-full items-center justify-between pt-[clamp(16px,1.5625vw,40px)] font-sans text-white">
      <Logo />
      <Nav />
      {/* <Button className="hidden sm:block">Join Us</Button> */}
    </header>
  );
};

export default Header;
