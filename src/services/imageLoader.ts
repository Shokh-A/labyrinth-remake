export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
}

export async function preloadImages() {
  const sources = [
    "/images/paths/Straight_EW.png",
    "/images/paths/Straight_NS.png",
    "/images/paths/Turn_NE.png",
    "/images/paths/Turn_NW.png",
    "/images/paths/Turn_SE.png",
    "/images/paths/Turn_SW.png",
    "/images/paths/Detour_NEW.png",
    "/images/paths/Detour_NSE.png",
    "/images/paths/Detour_NSW.png",
    "/images/paths/Detour_SEW.png",
    "/images/paths/Grass.png",
  ];
  const images = new Map<string, HTMLImageElement>();
  for (const src of sources) {
    const img = await preloadImage(src);
    images.set(src, img);
  }
  return images;
}
