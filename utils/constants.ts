import { EventType } from "@/types";

export const MIN_LOAD_TIME_PAGES = 800;

export const NAV_LINKS = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Events",
    href: "/events",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact Us",
    href: "/contact-us",
  },
];

export const NAV_COLLAGE_IMGS = [
  {
    images: [
      {
        href: "/images/collage/nav/home/0.png",
        width: 100,
      },
      {
        href: "/images/collage/nav/home/1.png",
        width: 100,
      },
      {
        href: "/images/collage/nav/home/2.png",
        width: 100,
      },
    ],
    associatedPath: "/",
  },
  {
    images: [
      { href: "/images/collage/nav/events/0.png", width: 40 },
      { href: "/images/collage/nav/events/1.png", width: 80 },
      { href: "/images/collage/nav/events/2.png", width: 80 },
    ],
    associatedPath: "/events",
  },
  {
    images: [
      { href: "/images/collage/nav/about/0.png", width: 100 },
      { href: "/images/collage/nav/about/1.png", width: 100 },
      { href: "/images/collage/nav/about/2.png", width: 100 },
    ],
    associatedPath: "/about",
  },
  {
    images: [
      { href: "/images/collage/nav/contact-us/0.png", width: 60 },
      { href: "/images/collage/nav/contact-us/1.png", width: 50 },
      { href: "/images/collage/nav/contact-us/2.png", width: 80 },
    ],
    associatedPath: "/contact-us",
  },
];

export const TEAMS = [
  {
    title: "Public Relations(PR)",
    imgSrc: "/juniors.jpg",
    speed: 0.5,
    reversed: true,
  },
  {
    title: "Human Resources(HR)",
    imgSrc: "/juniors.jpg",
    speed: 0.6,
    reversed: false,
  },
  {
    title: "Information Technology(IT)",
    imgSrc: "/juniors.jpg",
    speed: 0.8,
    reversed: true,
  },
  {
    title: "Media",
    imgSrc: "/juniors.jpg",
    speed: 0.4,
    reversed: false,
  },
  {
    title: "Quality Management(QM)",
    imgSrc: "/juniors.jpg",
    speed: 0.5,
    reversed: false,
  },
  {
    title: "Juniors",
    imgSrc: "/juniors.jpg",
    speed: 0.2,
    reversed: true,
  },
  {
    title: "Academy",
    imgSrc: "/juniors.jpg",
    speed: 0.3,
    reversed: false,
  },
  {
    title: "Fund Raising(FR)",
    imgSrc: "/juniors.jpg",
    speed: 0.3,
    reversed: true,
  },
];

export const ABOUT_SECTIONS_CONTENT: {
  title: string;
  descriptionBefore: string;
  descriptionAfter: string;
  imgSrc: string;
  inBetweenWord: string;
}[] = [
  {
    title: "Story",
    descriptionBefore:
      "Aviation Club is a Student-to-Student Organization, based in Faculty of Engineering Ain-shams University.",
    descriptionAfter:
      "Training and research abilities in Aviation field. Our Scope is to cover practical, theoretical training and research abilities in Aviation field",
    imgSrc: "/images/outing.webp",
    inBetweenWord: "Journey",
  },
  {
    title: "Mission",
    descriptionBefore:
      "To establish our Arabian society as a premier center for aviation research and development",
    descriptionAfter:
      "To foster innovation in the field, positioning our community at the forefront of aviation.",
    imgSrc: "/images/robolympics.webp",
    inBetweenWord: "Quest",
  },
  {
    title: "Vision",
    descriptionBefore:
      "To be the world's leading aviation office and to foster a community dedicated to excellence in the field.",
    descriptionAfter:
      "To establish our Arabian society as a premier center for aviation research.",
    imgSrc: "/images/events/juniors/3.jpg",
    inBetweenWord: "Dream",
  },
];

const height = 80;
const width = 100;
export const EVENTS: EventType[] = [
  {
    title: "robolympics",
    description: `Lorem ipsum dolor sit amet
consectetur adipiscing elit. Ut et
massa mi. Aliquam in hendrerit.`,
    images: [
      {
        imgSrc: "/images/events/robolympics/0.jpg",
        height: 100,
        width: 140,
        top: 250,
        left: 200,
      },
      {
        imgSrc: "/images/events/robolympics/1.jpg",
        height: 120,
        width: 100,
        top: -250,
        left: 200,
      },
      {
        imgSrc: "/images/events/robolympics/2.jpg",
        height: 90,
        width: 140,
        top: 250,
        left: -200,
      },
      {
        imgSrc: "/images/events/robolympics/3.jpg",
        height,
        width: 120,
        top: -250,
        left: -200,
      },
      {
        imgSrc: "/images/events/robolympics/5.jpg",
        height,
        width: 80,
        top: 250,
        left: 100,
      },
      {
        imgSrc: "/images/events/robolympics/6.jpg",
        height,
        width: 80,
        top: -150,
        left: 100,
      },
      {
        imgSrc: "/images/events/robolympics/7.jpg",
        height,
        width: 80,
        top: 150,
        left: -100,
      },
      {
        imgSrc: "/images/events/robolympics/8.jpg",
        height,
        width: 80,
        top: -150,
        left: -100,
      },
      {
        imgSrc: "/images/events/robolympics/9.jpg",
        height: 100,
        width: 160,
        top: 400,
        left: 150,
      },
      {
        imgSrc: "/images/events/robolympics/10.jpg",
        height,
        width: 60,
        top: -400,
        left: 150,
      },
      {
        imgSrc: "/images/events/robolympics/11.jpg",
        height,
        width,
        top: 400,
        left: -150,
      },
      {
        imgSrc: "/images/events/robolympics/12.jpg",
        height: 120,
        width,
        top: -400,
        left: -150,
      },
      {
        imgSrc: "/images/events/robolympics/4.jpg",
        height: 100,
        width: 160,
        top: 50,
        left: 50,
      },
    ],
  },
  {
    title: "juniors",
    description: `ipsum dolor sit amet
consectetur adipiscing elit. Ut et
massa mi. Aliquam in hendrerit.`,
    images: [
      {
        imgSrc: "/images/events/juniors/0.jpg",
        height,
        width: 120,
        top: 300,
        left: 250,
      },
      {
        imgSrc: "/images/events/juniors/1.jpg",
        height: 100,
        width: 80,
        top: -250,
        left: 200,
      },
      {
        imgSrc: "/images/events/juniors/2.jpg",
        height,
        width: 140,
        top: 250,
        left: -200,
      },
      {
        imgSrc: "/images/events/juniors/3.jpg",
        height,
        width: 120,
        top: -250,
        left: -200,
      },
      {
        imgSrc: "/images/events/juniors/4.jpg",
        height,
        width: 130,
        top: 250,
        left: 100,
      },
      {
        imgSrc: "/images/events/juniors/5.jpg",
        height,
        width: 140,
        top: -150,
        left: 100,
      },
      {
        imgSrc: "/images/events/juniors/6.jpg",
        height,
        width: 120,
        top: 150,
        left: -100,
      },
      {
        imgSrc: "/images/events/juniors/8.jpg",
        height,
        width: 80,
        top: 400,
        left: 150,
      },
      {
        imgSrc: "/images/events/juniors/9.jpg",
        height,
        width,
        top: -400,
        left: 150,
      },
      {
        imgSrc: "/images/events/juniors/10.jpg",
        height,
        width: 80,
        top: 400,
        left: -150,
      },
      {
        imgSrc: "/images/events/juniors/11.jpg",
        height,
        width: 120,
        top: -400,
        left: -150,
      },
      {
        imgSrc: "/images/events/juniors/12.jpg",
        height,
        width: 120,
        top: 50,
        left: 50,
      },
      {
        imgSrc: "/images/events/juniors/7.jpg",
        height: 100,
        width: 160,
        top: -150,
        left: -100,
      },
    ],
  },
  {
    title: "academy",
    description: `Lorem ipsum sit amet
consectetur adipiscing elit. Ut et
massa mi. Aliquam in hendrerit.`,
    images: [
      {
        imgSrc: "/images/events/academy/1.jpg",
        width: 120,
        height,
        top: -250,
        left: 200,
      },
      {
        imgSrc: "/images/events/academy/2.jpg",
        width: 140,
        height: 100,
        top: 280,
        left: -250,
      },
      {
        imgSrc: "/images/events/academy/3.jpg",
        width: 100,
        height: 100,
        top: -250,
        left: -200,
      },
      {
        imgSrc: "/images/events/academy/4.jpg",
        width: 100,
        height: 120,
        top: 250,
        left: 100,
      },
      {
        imgSrc: "/images/events/academy/5.jpg",
        width: 80,
        height: 80,
        top: -150,
        left: 100,
      },
      {
        imgSrc: "/images/events/academy/6.jpg",
        width: 120,
        height: 100,
        top: 150,
        left: -100,
      },
      {
        imgSrc: "/images/events/academy/7.jpg",
        width: 100,
        height: 100,
        top: -150,
        left: -100,
      },
      {
        imgSrc: "/images/events/academy/8.jpg",
        width: 120,
        height,
        top: 400,
        left: 150,
      },
      {
        imgSrc: "/images/events/academy/9.jpg",
        width: 80,
        height,
        top: -400,
        left: 150,
      },
      {
        imgSrc: "/images/events/academy/10.jpg",
        width: 120,
        height: 80,
        top: 400,
        left: -150,
      },
      {
        imgSrc: "/images/events/academy/11.jpg",
        width: 100,
        height: 100,
        top: -400,
        left: -150,
      },
      {
        imgSrc: "/images/events/academy/12.jpg",
        width: 140,
        height: 120,
        top: -150,
        left: 250,
      },
      {
        imgSrc: "/images/events/academy/0.jpg",
        width: 160,
        height: 100,
        top: 50,
        left: 50,
      },
    ],
  },
];
