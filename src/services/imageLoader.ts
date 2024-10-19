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
