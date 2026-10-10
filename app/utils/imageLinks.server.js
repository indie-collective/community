import { toOrigin } from './origin.server';

// An image's URLs: on CDN_HOST, the R2 bucket's domain (ADR 0002, with or
// without https://), or without one (development, tests) from this app's
// /images route.
const base = () => toOrigin(process.env.CDN_HOST) || '/images';

export default function getImageLinks(image) {
  const name = image.image_file.name;
  if (name?.startsWith('http')) {
    return {
      id: image.id,
      url: name,
      thumbnail_url: name,
    };
  }
  return {
    id: image.id,
    url: `${base()}/${name}`,
    thumbnail_url: `${base()}/thumb_${name}`,
  };
}
