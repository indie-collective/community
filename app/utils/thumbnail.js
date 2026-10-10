// Thumbnails are made in the browser, at upload (ADR 0002): Workers can't
// decode images, and transforming them on request is capped.
export const THUMBNAIL_HEIGHT = 400;

/**
 * An image file's size, and a thumbnail THUMBNAIL_HEIGHT pixels high (or
 * the image's own height, if less) as a WebP or JPEG file; null when the
 * browser can't draw the file.
 *
 * @returns {Promise<{ width: number, height: number, thumbnail: File } | null>}
 */
export async function makeThumbnail(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, THUMBNAIL_HEIGHT / height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type) =>
    new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
  // Browsers that can't write WebP fall back to PNG; prefer JPEG then.
  let blob = await encode('image/webp');
  if (blob?.type !== 'image/webp') blob = await encode('image/jpeg');
  if (!blob) return null;

  const extension = blob.type.split('/')[1];
  return {
    width,
    height,
    thumbnail: new File([blob], `thumb.${extension}`, { type: blob.type }),
  };
}
