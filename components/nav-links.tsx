"use client";
// Next
import { usePathname } from "next/navigation";
import Link from "next/link";
// Constants
import { NAV_LINKS } from "@/utils/constants";
import { useEffect, useRef, useState } from "react";

// Types
type NavLinksPropsType = {
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
  previousLink: string | null;
};

const NavLinks = ({ onClick, previousLink }: NavLinksPropsType) => {
  const windowWidth = useRef<number | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (window) {
      windowWidth.current = window.innerWidth;
    }
  }, []);
  return NAV_LINKS.map((link) => (
    <li
      key={link.title}
      className="links__wrapper relative z-base flex h-1/2 flex-col overflow-hidden"
    >
      <Link
        href={link.href}
        onClick={onClick}
        className="link__visible"
        style={{
          fontKerning: "none",
          WebkitTextStroke:
            pathname === link.href || link.href === previousLink
              ? `${windowWidth.current && windowWidth.current < 800 ? 1 : 2}px black`
              : "",
          WebkitTextFillColor:
            pathname === link.href || link.href === previousLink
              ? "transparent"
              : "",
        }}
      >
        {link.title}
      </Link>
      <Link
        href={link.href}
        onClick={onClick}
        className="link__hidden absolute z-hidden text-brand-yellow"
        style={{
          fontKerning: "none",
        }}
      >
        {link.title}
      </Link>
    </li>
  ));
};

export default NavLinks;
