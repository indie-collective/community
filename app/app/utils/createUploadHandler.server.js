import AWS from 'aws-sdk';
import jimp from 'jimp';

const { NODE_ENV, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

const isDev = NODE_ENV !== 'production';

const CDN = `cdn${isDev ? '-dev' : ''}.indieco.xyz`;

const s3 = new AWS.S3({
  endpoint: 's3.fr-par.scw.cloud',
  region: 'fr-par',
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  // s3ForcePathStyle: true,
  params: { Bucket: CDN },
});

async function uploadStreamToS3(stream, { extension }) {
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  const newFilename = `${timestamp}.${extension}`;

  const chunks = [];
  const imageBuffer = await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

  try {
    const { ETag, VersionId } = await s3
      .putObject({
        ACL: 'public-read',
        Key: newFilename,
        Body: imageBuffer,
        ContentType: mimetype,
        CacheControl: 'max-age=31536000',
      })
      .promise();

    const image = await jimp.read(imageBuffer);
    const { width, height } = image.bitmap;

    await image.resize(jimp.AUTO, 400);
    const buffer = await image.getBufferAsync(jimp.AUTO);

    const { ETag: thumbETag, VersionId: thumbVersionId } = await s3
      .putObject({
        ACL: 'public-read',
        Key: `thumb_${newFilename}`,
        Body: buffer,
        ContentType: image.getMIME(),
        CacheControl: 'max-age=31536000',
      })
      .promise();

    return {
      name: newFilename,
      ETag,
      VersionId,
      width,
      height,
      thumbETag,
      thumbVersionId,
      thumb_width: image.bitmap.width,
      thumb_height: image.bitmap.height,
    };
  } catch (err) {
    throw new Error('Something wrong occurred when uploading');
  }
}

export default function createUploadHandler(fileInputs) {
  return function uploadHandler({name, stream, filename}) {
    if (!fileInputs.includes(name)) {
      stream.resume();
      return;
    }

    // const uploadedImage = await uploadStreamToS3(
    //   stream,
    //   {extension: filename.split('.').pop()}
    // );

    // TODO: create an image in the db and return the id

    // return uploadedImage.id;
    return 'myimageid';
  }
}