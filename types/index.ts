export type ImageType = {
  imgSrc: string;
  height: number;
  width: number;
  top?: number;
  left?: number;
};
export type EventType = {
  title: "robolympics" | "juniors" | "academy";
  description: string;
  images: ImageType[];
};
