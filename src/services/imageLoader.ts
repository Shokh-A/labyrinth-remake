import northEastWest from "../assets/images/paths/Detour_NEW.png";
import northSouthEast from "../assets/images/paths/Detour_NSE.png";
import northSouthWest from "../assets/images/paths/Detour_NSW.png";
import southEastWest from "../assets/images/paths/Detour_SEW.png";
import eastWest from "../assets/images/paths/Straight_EW.png";
import northSouth from "../assets/images/paths/Straight_NS.png";
import northEast from "../assets/images/paths/Turn_NE.png";
import northWest from "../assets/images/paths/Turn_NW.png";
import southEast from "../assets/images/paths/Turn_SE.png";
import southWest from "../assets/images/paths/Turn_SW.png";

export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

export async function preloadImages(
  sources: string[]
): Promise<Map<string, HTMLImageElement>> {
  const images = new Map<string, HTMLImageElement>();
  for (const src of sources) {
    const img = await preloadImage(src);
    images.set(src, img);
  }
  return images;
}

export interface Path {
  imgSrc: string;
  paths: string[];
}

export const pathsMap: { [key: string]: Path } = {
  southEast: { imgSrc: southEast, paths: ["SOUTH", "EAST"] },
  southWest: { imgSrc: southWest, paths: ["SOUTH", "WEST"] },
  northEast: { imgSrc: northEast, paths: ["NORTH", "EAST"] },
  northWest: { imgSrc: northWest, paths: ["NORTH", "WEST"] },
  northSouth: { imgSrc: northSouth, paths: ["NORTH", "SOUTH"] },
  eastWest: { imgSrc: eastWest, paths: ["EAST", "WEST"] },
  northSouthEast: { imgSrc: northSouthEast, paths: ["NORTH", "SOUTH", "EAST"] },
  northSouthWest: { imgSrc: northSouthWest, paths: ["NORTH", "SOUTH", "WEST"] },
  northEastWest: { imgSrc: northEastWest, paths: ["NORTH", "EAST", "WEST"] },
  southEastWest: { imgSrc: southEastWest, paths: ["SOUTH", "EAST", "WEST"] },
};
