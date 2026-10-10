// Uploaded images, stored in R2 (ADR 0002). The browser sends, with each
// file in an upload input `name`, a thumbnail in `name_thumb` and the
// image's size in `name_width` and `name_height` (see utils/thumbnail);
// they're stored as `<key>` and `thumb_<key>`. Without a thumbnail (no
// JavaScript, or a format the browser can't draw), the image is its own.
import { env } from 'cloudflare:workers';

import { createImage } from '../data/images.server';

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

// A new key: when, plus a random part, plus the file's extension.
function newKey(filename, contentType) {
  const extension =
    filename?.match(/\.([a-z0-9]{1,5})$/i)?.[1]?.toLowerCase() ??
    contentType?.split('/')[1] ??
    'bin';
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  return `${timestamp}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
}

const size = (value) => {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : null;
};

async function store(file, thumbnail, { width, height }) {
  const key = newKey(file.name, file.type);
  await Promise.all([
    env.IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type, cacheControl: CACHE_CONTROL },
    }),
    env.IMAGES.put(`thumb_${key}`, (thumbnail ?? file).stream(), {
      httpMetadata: {
        contentType: (thumbnail ?? file).type,
        cacheControl: CACHE_CONTROL,
      },
    }),
  ]);
  return createImage({ name: key, width, height });
}

/**
 * The form data with each file in `fileInputs` uploaded and replaced by its
 * upload's ID ('' for an empty input), and their thumbnails and sizes left
 * out. Other files and fields pass through.
 */
export async function parseFormWithUploads(request, fileInputs) {
  const formData = await request.formData();
  const extras = new Set(
    fileInputs.flatMap((name) => [
      `${name}_thumb`,
      `${name}_width`,
      `${name}_height`,
    ])
  );
  const result = new FormData();
  const seen = Object.fromEntries(fileInputs.map((name) => [name, 0]));

  for (const [name, value] of formData.entries()) {
    if (extras.has(name)) continue;
    if (typeof value === 'string' || !fileInputs.includes(name)) {
      result.append(name, value);
      continue;
    }

    // The nth file of an input goes with the nth thumbnail and size.
    const index = seen[name]++;
    if (value.size === 0) {
      result.append(name, '');
      continue;
    }
    const thumbnail = formData.getAll(`${name}_thumb`)[index];
    result.append(
      name,
      await store(
        value,
        thumbnail instanceof File && thumbnail.size > 0 ? thumbnail : null,
        {
          width: size(formData.getAll(`${name}_width`)[index]),
          height: size(formData.getAll(`${name}_height`)[index]),
        }
      )
    );
  }

  return result;
}
