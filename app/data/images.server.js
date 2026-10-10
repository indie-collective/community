// Uploaded images (#151, part 2): the record of a file in the bucket. Which
// game, organisation, event or person uses it is set through their own
// modules.
import { db } from '../utils/db.server';

/**
 * Records an uploaded file (`{ name, … }` as the bucket returned it).
 * @returns {Promise<string>} the image's ID
 */
export async function createImage(imageFile) {
  const image = await db.image.create({
    data: { image_file: imageFile },
    select: { id: true },
  });
  return image.id;
}
