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
    url: `https://${process.env.CDN_HOST}/${name}`,
    thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${name}`,
  };
}
