import AWS from 'aws-sdk';
import { Jimp } from 'jimp';

import { createImage } from '../data/images.server';

const { NODE_ENV, CDN_HOST, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

const isDev = NODE_ENV !== 'production';

const s3 = new AWS.S3({
  endpoint: 's3.fr-par.scw.cloud',
  region: 'fr-par',
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  // s3ForcePathStyle: true,
  params: { Bucket: CDN_HOST },
});

async function uploadStreamToS3(data, { extension, contentType }) {
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  const newFilename = `${timestamp}.${extension}`;

  const chunks = [];
  for await (const chunk of data) {
    chunks.push(chunk);
  }

  const imageBuffer = Buffer.concat(chunks);

  if (imageBuffer.length === 0) {
    throw new Error('Empty');
  }

  try {
    const { ETag, VersionId } = await s3
      .putObject({
        ACL: 'public-read',
        Key: newFilename,
        Body: imageBuffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000',
      })
      .promise();

    const image = await Jimp.fromBuffer(imageBuffer);
    const { width, height } = image.bitmap;
    const resized = image.resize({ h: 400 });

    const { ETag: thumbETag, VersionId: thumbVersionId } = await s3
      .putObject({
        ACL: 'public-read',
        Key: `thumb_${newFilename}`,
        Body: resized.getBuffer(),
        ContentType: image.mime,
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
    console.log(err);

    throw new Error('Something wrong occurred when uploading');
  }
}

export default function createUploadHandler(fileInputs) {
  return async ({name, contentType, data, filename}) => {
    if (!fileInputs.includes(name)) {
      return undefined;
    }

    try {
      const bucketEntry = await uploadStreamToS3(
        data,
        {extension: filename.split('.').pop(), contentType}
      );
  
      return await createImage(bucketEntry);
    } catch (err) {
      if (err.message === 'Empty') {
        // due to memoryhandler required to avoid the nullification of everything
        // we need to return something other than undefined or null
        // this might change in the future
        return '';
      }

      throw err;
    }
  }
}
// Replaces Remix's unstable_parseMultipartFormData with
// composeUploadHandlers(createUploadHandler(fileInputs), memory handler),
// which React Router 7 dropped. Files in `fileInputs` are uploaded and become
// their image id ('' for an empty input); other files and fields pass through.
export async function parseFormWithUploads(request, fileInputs) {
  const upload = createUploadHandler(fileInputs);
  const formData = await request.formData();
  const result = new FormData();

  for (const [name, value] of formData.entries()) {
    if (typeof value === 'string' || !fileInputs.includes(name)) {
      result.append(name, value);
      continue;
    }

    if (value.size === 0) {
      result.append(name, '');
      continue;
    }

    const imageId = await upload({
      name,
      contentType: value.type,
      data: value.stream(),
      filename: value.name,
    });
    result.append(name, imageId);
  }

  return result;
}
