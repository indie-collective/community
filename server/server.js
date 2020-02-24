const fs = require('fs');
const path = require('path');
const express = require('express');
const { postgraphile } = require('postgraphile');
const { graphqlUploadExpress } = require('graphql-upload');
const jimp = require('jimp');
const expressPlayground = require('graphql-playground-middleware-express').default

const PostGraphileUploadFieldPlugin = require('postgraphile-plugin-upload-field');
const PostGraphileDerivedFieldPlugin = require('postgraphile-plugin-derived-field');
const PgManyToManyPlugin = require('@graphile-contrib/pg-many-to-many');
const PgSimplifyInflector = require('@graphile-contrib/pg-simplify-inflector');
const ConnectionFilterPlugin = require('postgraphile-plugin-connection-filter');

const { jwtSecret } = require('./config.json');

require('dotenv').config();

const {DB_USER, DB_PASS} = process.env;

const DB_URL =
  DB_USER && DB_PASS
    ? `postgres://${DB_USER}:${DB_PASS}@localhost:5432/indieco`
    : 'postgres://localhost:5432/indieco';

const thisServerUrl = isDev ? 'http://localhost:4000' : 'https://community.indieco.xyz';

const app = express();

const UPLOAD_DIR_NAME = 'uploads';
const IMAGES_PATH = '/images';

// Serve uploads as static resources
app.use(IMAGES_PATH, express.static(path.resolve(UPLOAD_DIR_NAME)));

// Attach multipart request handling middleware
app.use(graphqlUploadExpress());

app.use(
  postgraphile(DB_URL, 'indieco', {
    graphiql: !(DB_USER && DB_PASS),
    watchPg: !(DB_USER && DB_PASS),
    enableCors: !(DB_USER && DB_PASS),
    disableQueryLog: true,
    appendPlugins: [
      PostGraphileUploadFieldPlugin,
      PostGraphileDerivedFieldPlugin,
      PgManyToManyPlugin,
      PgSimplifyInflector,
      ConnectionFilterPlugin,
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
          identifiers: [{
            columns: 'image_file',
          }],
          inflect: fieldName => 'url',
          resolve: image => {
            if (image) {
              return `${thisServerUrl}${IMAGES_PATH}/${image.name}`;
            }
          },
        },
        {
          identifiers: [{
            columns: 'image_file',
          }],
          inflect: fieldName => 'thumbnail_url',
          resolve: image => {
            if (image) {
              return `${thisServerUrl}${IMAGES_PATH}/thumb_${image.name}`;
            }
          },
        }
      ],
    },
  })
);

if (!(DB_USER && DB_PASS)) {
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))
}

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});

async function resolveUpload(upload) {
  const { filename, createReadStream } = upload;
  const stream = createReadStream();

  const localFilename = await saveLocal({ stream, filename });
  const image = await jimp.read(
    path.join(process.cwd(), UPLOAD_DIR_NAME, localFilename)
  );
  const { width, height } = image.bitmap;

  await image.resize(jimp.AUTO, 400);
  await image.writeAsync(
    path.join(process.cwd(), UPLOAD_DIR_NAME, `thumb_${localFilename}`)
  );

  return {
    name: localFilename,
    width,
    height,
    thumb_width: image.bitmap.width,
    thumb_height: image.bitmap.height,
  };
}

function saveLocal({ stream, filename }) {
  const timestamp = new Date().toISOString().replace(/\D/g, '');
  const localFilename = `${timestamp}.${filename.split('.').pop()}`;
  const fsPath = path.join(process.cwd(), UPLOAD_DIR_NAME, localFilename);

  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated) fs.unlinkSync(fsPath);
        reject(error);
      })
      .on('end', () => resolve(localFilename))
      .pipe(fs.createWriteStream(fsPath))
  );
}
