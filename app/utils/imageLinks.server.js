export default function getImageLinks(image) {
  return {
    id: image.id,
    url: `https://${process.env.CDN_HOST}/${image.image_file.name}`,
    thumbnail_url: `https://${process.env.CDN_HOST}/thumb_${image.image_file.name}`,
  };
}
