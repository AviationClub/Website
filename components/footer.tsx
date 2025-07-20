"use client";
import React, { useEffect, useRef } from "react";
import Button from "./ui/button";
import Link from "next/link";

const MENU = [
  {
    imgSrc: "/images/robolympics.webp",
    title: "Events",
    href: "/events",
  },
  { imgSrc: "/images/about-small.webp", title: "About", href: "/about" },
  {
    imgSrc: "/images/contact-us-small.webp",
    title: "Contact Us",
    href: "/contact-us",
  },
];

const SOCIAL_MEDIA_ICONS = [
  {
    label: "Facebook",
    src: "/svgs/facebook.svg",
    href: "https://www.facebook.com/egaviationclub",
  },
  {
    label: "Linkedin",
    src: "/svgs/linkedin.svg",
    href: "https://www.linkedin.com/company/aviation-club-eg",
  },
  {
    label: "Instagram",
    src: "/svgs/instagram.svg",
    href: "",
  },
];

const Footer = () => {
  const scrollTo = useRef(() => {});
  useEffect(() => {
    scrollTo.current = function () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    };
  }, []);

  const handleScrollUp = function () {
    scrollTo.current();
  };
  return (
    <footer className="px-clamp mt-[8rem] flex flex-col gap-2 bg-primary-dark py-14 font-sans text-[clamp(16px,1.875vw,48px)]">
      <div className="flex items-center justify-between">
        <p>Menu</p>
        <ul className="flex gap-8 sm:hidden">
          {MENU.map((item) => (
            <li key={item.title}>
              <a href={item.href}>{item.title}</a>
            </li>
          ))}
        </ul>
        <ul className="hidden gap-1 sm:flex">
          {MENU.map((item) => (
            <li
              key={item.title}
              className="w-[clamp(180px,17vw,435px)] overflow-hidden rounded-[8px]"
            >
              <figure className="relative z-0">
                <figcaption className="absolute-center peer z-[9999] whitespace-nowrap text-[clamp(32px,3.75vw,96px)]">
                  <Link href={item.href}>{item.title}</Link>
                </figcaption>
                <img
                  className="transition duration-300 peer-hover:scale-110"
                  src={item.imgSrc}
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-black opacity-30"></div>
              </figure>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div className="flex items-center justify-between">
        <p>Follow Us</p>
        <ul className="flex items-center gap-8 lg:gap-4">
          {SOCIAL_MEDIA_ICONS.map((icon) => (
            <li
              key={icon.label}
              className="aspect-square rounded-full bg-foreground fill-background p-1 sm:p-2"
            >
              <Link href={icon.href} aria-label={icon.label}>
                <img
                  className="h-[clamp(16px,2vw,32px)]"
                  src={icon.src}
                  alt={icon.label}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="leading-none">Aviation Club</p>
          <div>
            <img
              src="/svgs/copyright.svg"
              className="h-[clamp(16px,1.25vw,32px)]"
              alt="copyright symbol"
            />
          </div>
          <p className="leading-none">All Rights Reserved</p>
        </div>
        <div className="flex items-center gap-4">
          <p>2024</p>
          <Button
            onClick={handleScrollUp}
            className="aspect-square bg-primary-dark px-1 sm:px-2"
            aria-label="Go Up"
          >
            <img
              className="h-[clamp(16px,2.5vw,32px)] fill-blue-500 text-red-300"
              src="/svgs/arrow-up.svg"
              alt="Arrow up"
            />
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
