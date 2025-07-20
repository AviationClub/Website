import { transform } from "next/dist/build/swc";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-aalto)",
        serif: "var(--font-apoc)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          dark: "hsl(var(--primary-dark))",
        },
        brand: {
          yellow: "hsl(var(--brand-yellow))",
          red: "hsl(var(--brand-red))",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        noise: "url(../assets/images/Noise.png)",
        sky: "url(../assets/images/clouds.jpg)",
      },
      transitionTimingFunction: {
        primary: "cubic-bezier(.6, 0, .1, 1)",
      },
      transitionDuration: {
        "500": "500ms", // 0.5s
      },
      animation: {
        noise: "noise 1.5s steps(6) infinite",
        "spin-slow": "spin 10s linear infinite",
        drag: "drag 3s linear infinite ",
        "shrink-grow": "shrink-grow 3s ease-in-out infinite",
      },
      keyframes: {
        "shrink-grow": {
          "0%,100%": {
            transform: "scaleY(0.91)",
          },
          "50%": {
            transform: "scaleY(0)",
          },
        },
        drag: {
          "0%": { transform: "translate(0%,0%)" },
          "12.5%": { transform: "translate(10%,-10%)" },
          "25%": { transform: "translate(0%,0%)" },
          "37.5%": { transform: "translate(-10%,-10%)" },
          "50%": { transform: "translate(0%,0%)" },
          "62.5%": { transform: "translate(-10%,10%)" },
          "75%": { transform: "translate(0%,0%)" },
          "87.5%": { transform: "translate(10%,10%)" },
          "100%": { transform: "translate(0%,0%)" },
        },
      },
      zIndex: {
        hidden: "-1",
        base: "0",
        content: "10",
        overlay: "20",
        dropdown: "30",
        modal: "40",
        popover: "50",
        tooltip: "60",
        navbar: "70",
        drawer: "80",
        notification: "90",
        topmost: "100",
      },
    },
  },
  plugins: [],
};
export default config;
