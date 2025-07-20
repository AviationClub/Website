// Utils
import { cn } from "@/utils";
// GSAP
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MouseEventHandler } from "react";
import { ImageType } from "@/types";

type EventImageListPropsType = {
  images: ImageType[];
  onClick: MouseEventHandler<HTMLElement>;
  messageVisible: boolean;
  canvasVisible: boolean;
  title: string;
};

const EventImageList = ({
  images,
  onClick,
  messageVisible,
  canvasVisible,
  title,
}: EventImageListPropsType) => {
  const { contextSafe } = useGSAP();

  const handleMouseHover = contextSafe(function(isEntering: boolean) {
    gsap.to(".message__expand__text", {
      clipPath:
        isEntering && canvasVisible
          ? "circle(150% at 0 0)"
          : "circle(0% at 0 0)",
      duration: 0.4,
    });
  });

  return (
    <ul>
      {images.map((img, i) => (
        <div key={i}>
          <li
            onClick={onClick}
            onMouseEnter={() => handleMouseHover(true)}
            onMouseLeave={() => handleMouseHover(false)}
            className={cn(
              "card absolute left-1/2 top-1/2 z-hidden -translate-y-full select-none overflow-hidden rounded-[32px] opacity-0",
              {
                "cursor-pointer": messageVisible,
                "cursor-auto": !messageVisible,
              },
            )}
            style={{
              minWidth: `${img.width * 0.2 * 10}px`,
              maxWidth: `${img.width * 10}px`,
              maxHeight: `${img.height * 7}px`,
              width: `${img.width}rem`,
              height: `${img.height}rem`,
            }}
          >
            <div className="pointer-events-none absolute inset-0 z-content bg-black opacity-25"></div>
            <img
              className="card__img pointer-events-none h-full w-full object-cover"
              src={img.imgSrc}
              alt={title}
            />
          </li>
        </div>
      ))}
    </ul>
  );
};

export default EventImageList;
