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
    "/images/paths/Road 1.png",
    "/images/paths/Road 2.png",
    "/images/paths/Road 4 Turn.png",
    "/images/paths/Road 5 Turn.png",
    "/images/paths/Road 6 Turn.png",
    "/images/paths/Road 7 Turn.png",
    "/images/paths/Road 8 Detour.png",
    "/images/paths/Road 9 Detour.png",
    "/images/paths/Road 10 Detour.png",
    "/images/paths/Road 11 Detour.png",
    "/images/paths/Terrain 1.png",
  ];
  const images = new Map<string, HTMLImageElement>();
  for (const src of sources) {
    const img = await preloadImage(src);
    images.set(src, img);
  }
  return images;
}
