import AWS from 'aws-sdk';
import jimp from 'jimp';

import { db } from './db.server';

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

    const image = await jimp.read(imageBuffer);
    const { width, height } = image.bitmap;
    image.resize(jimp.AUTO, 400);
    
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
  
      const image = await db.image.create({
        data: {
          image_file: bucketEntry,
        },
        select: {
          id: true,
        },
      });
  
      return image.id;
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