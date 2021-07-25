const path = require('path');
const express = require('express');
const { postgraphile } = require('postgraphile');
const { graphqlUploadExpress } = require('graphql-upload');
const jimp = require('jimp');
const AWS = require('aws-sdk');
const expressPlayground = require('graphql-playground-middleware-express')
  .default;

const PostGraphileUploadFieldPlugin = require('postgraphile-plugin-upload-field');
const PostGraphileDerivedFieldPlugin = require('postgraphile-plugin-derived-field');
const PgManyToManyPlugin = require('@graphile-contrib/pg-many-to-many');
const PgSimplifyInflector = require('@graphile-contrib/pg-simplify-inflector');
const ConnectionFilterPlugin = require('postgraphile-plugin-connection-filter');
const UpsertPlugin = require('./PgUpsertPlugin');
const CityPlugin = require('./CityPlugin');

const { jwtSecret } = require('./config.json');

const isDev = process.env.NODE_ENV !== 'production';

require('dotenv').config();

const {
  DB_USER,
  DB_PASS,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} = process.env;

const DB_URL =
  DB_USER && DB_PASS
    ? `postgres://${DB_USER}:${DB_PASS}@localhost:5432/indieco`
    : 'postgres://localhost:5432/indieco';

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

const app = express();

const UPLOAD_DIR_NAME = 'uploads';
const IMAGES_PATH = '/images';

// Serve uploads as static resources
app.use(IMAGES_PATH, express.static(path.resolve(UPLOAD_DIR_NAME)));

// Attach multipart request handling middleware
app.use(graphqlUploadExpress());

app.use(
  postgraphile(DB_URL, 'indieco', {
    graphiql: false,
    watchPg: isDev,
    enableCors: isDev,
    disableQueryLog: true,
    appendPlugins: [
      PostGraphileUploadFieldPlugin,
      PostGraphileDerivedFieldPlugin,
      PgManyToManyPlugin,
      PgSimplifyInflector,
      ConnectionFilterPlugin,
      UpsertPlugin,
      CityPlugin,
    ],
    jwtSecret,
    jwtPgTypeIdentifier: 'indieco.jwt_token',
    pgDefaultRole: 'indieco_anonymous',
    graphileBuildOptions: {
      uploadFieldDefinitions: [
        {
          match: ({ schema, table, column, tags }) => {
            return column === 'image_file';
          },
          resolve: resolveUpload,
        },
      ],
      derivedFieldDefinitions: [
        {
          identifiers: [
            {
              columns: 'image_file',
            },
          ],
          inflect: (fieldName) => 'url',
          resolve: (image) => {
            if (image) {
              return `https://${CDN}/${image.name}`;
            }
            return null;
          },
        },
        {
          identifiers: [
            {
              columns: 'image_file',
            },
          ],
          inflect: (fieldName) => 'thumbnail_url',
          resolve: (image) => {
            if (image) {
              return `https://${CDN}/thumb_${image.name}`;
            }
            return null;
          },
        },
      ],
      connectionFilterRelations: true,
    },
  })
);

if (isDev) {
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
}

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});

const storeUpload = async ({ object, filename }) => {
  const upload = s3.putObject({
    ACL: 'public-read',
    Key: filename,
    Body: object,
  });

  return upload.promise();
};

async function resolveUpload(upload) {
  const { filename, createReadStream } = upload;
  const stream = createReadStream();

  if (!stream) {
    throw new Error(
      'File is not defined, did you forget to use Content-Type: multipart/form-data?'
    );
  }

  const timestamp = new Date().toISOString().replace(/\D/g, '');
  const newFilename = `${timestamp}.${filename.split('.').pop()}`;

  const chunks = [];
  const imageBuffer = await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

  try {
    const { ETag, VersionId } = await storeUpload({
      object: imageBuffer,
      filename: newFilename,
    });

    const image = await jimp.read(imageBuffer);
    const { width, height } = image.bitmap;

    await image.resize(jimp.AUTO, 400);
    const buffer = await image.getBufferAsync(jimp.AUTO);

    const { ETag: thumbETag, VersionId: thumbVersionId } = await storeUpload({
      object: buffer,
      filename: `thumb_${newFilename}`,
    });

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
