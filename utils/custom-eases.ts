import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
export const smoothEase = CustomEase.create("animation-smooth", ".7, 0, .3, 1");
