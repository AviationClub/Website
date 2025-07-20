import React from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={twMerge(
        "group relative grid place-content-center overflow-hidden rounded-full border-[1px] border-foreground px-[clamp(16px,1.25vw,32px)] py-2 text-[clamp(24px,1.875vw,48px)] text-foreground transition duration-300 hover:border-black hover:fill-black hover:text-black",
        className,
      )}
    >
      {children}
      <span className="absolute inset-0 z-hidden h-full w-full origin-bottom scale-y-0 bg-brand-yellow transition duration-300 group-hover:scale-y-100"></span>
    </button>
  );
};

export default Button;
