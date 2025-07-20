import React from "react";
import Link from "next/link";

const Logo = () => {
  return (
    <div className="relative z-navbar aspect-[244/114] w-[clamp(122px,9.5vw,244px)]">
      <Link href="/">
        <img
          src="/logos/logo.png"
          alt="Aviation Club Logo"
          className="object-cover"
        />
      </Link>
    </div>
  );
};

export default Logo;
