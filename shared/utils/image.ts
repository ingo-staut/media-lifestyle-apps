export function isImageFilePath(value: string) {
  return (
    value.endsWith(".svg") ||
    value.endsWith(".png") ||
    value.endsWith(".webp") ||
    value.endsWith(".gif") ||
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg")
  );
}

export async function findLandscapeImage(images: string[]): Promise<string | undefined> {
  for (const image of images) {
    const dimensions = await getImageDimensions(image);

    if (dimensions.width > dimensions.height) {
      return image;
    }
  }

  return undefined;
}

export async function getImageDimensions(
  image: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = image;

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
  });
}
