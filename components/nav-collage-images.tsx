import { NAV_COLLAGE_IMGS } from "@/utils/constants";
import { cn } from "@/utils";

const NavCollageImages = () => {
  return (
    <>
      {NAV_COLLAGE_IMGS.map((collage, i) => (
        <div key={i}>
          {collage.images.map((image) => (
            <div
              key={image.href}
              className={cn(
                "collage__card absolute left-1/2 top-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2",
              )}
              style={{
                width: `${image.width}rem`,
              }}
              data-path={collage.associatedPath}
            >
              <img
                src={image.href}
                alt="a cutout shape from a piece of paper"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
export default NavCollageImages;
