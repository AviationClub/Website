"use client";

// React
import { useRef } from "react";
// Next
import Link from "next/link";
// GSAP
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { horizontalLoop } from "@/utils";

// Animations
const animateEmails = function () {
  const emailElements = gsap.utils.toArray(".email");
  horizontalLoop(emailElements, {
    speed: 0.8,
    reversed: true,
    repeat: -1,
    paddingRight: "1.6rem",
  });
};

const ContactUsEmails = () => {
  const container = useRef<HTMLDivElement | null>(null);
  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe) return;
      const contextSafeAnimateEmails = contextSafe(() => animateEmails());
      contextSafeAnimateEmails();
    },
    { scope: container },
  );

  return (
    <div ref={container} className="flex gap-[max(8px,1.6rem)]">
      {[...new Array(12)].map((_, i) => (
        <Link
          key={i}
          className="email flex items-center gap-[max(8px,1.6rem)]"
          href="mailto: aviationclubeg@outlook.com"
        >
          <p className="font-sans text-[max(60px,12.8rem)] leading-none transition-colors hover:text-brand-yellow">
            Aviationclubeg@outlook.com
          </p>
          <div className="w-[max(50px,11.2rem)]">
            <img
              className="object-cover"
              src="/logos/logo-small-white.svg"
              alt="Aviation mini logo"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ContactUsEmails;
