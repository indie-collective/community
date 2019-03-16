const { createWriteStream } = require('fs');
const { resolve } = require('path');
const mkdirp = require('mkdirp');
const sizeOf = require('image-size');
const { hash, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');

const { APP_SECRET, getUserId } = require('../utils');

// create files/images dir
mkdirp(resolve(__dirname, '../../static/images'), (err) => {
  if (err) {
    console.error(err);
    process.exit();
  }
});

const allowedMimes = [
  'image/gif',
  'image/jpeg',
  'image/png',
];

const storeImage = async (stream, name) => {
  const path = resolve(__dirname, '../../static/images', name);

  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on('finish', () => resolve({ path }))
      .on('error', reject)
  );
}

const processUpload = async (upload, context) => {
  const { mimetype, createReadStream } = await upload;
  const stream = createReadStream();

  if (!allowedMimes.includes(mimetype)) {
    throw new Error(`Files of mimetype ${mimetype} are not currently accepted`);
  }

  const image = await context.prisma.createImage({ mimetype });
  const extension = mimetype.split('/')[1];
  const name = `${image.id}.${extension}`;
  
  const { path } = await storeImage(stream, name);
  const { width, height } = sizeOf(path);
  
  return await context.prisma.updateImage({
    data: {
      width, height,
    },
    where: {
      id: image.id,
    },
  });
}

const Mutation = {
  signup: async (parent, { email, password }, context) => {
    const hashedPassword = await hash(password, 10);
    const user = await context.prisma.createUser({
      email,
      password: hashedPassword,
    });

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    };
  },

  login: async (parent, { email, password }, context) => {
    const user = await context.prisma.user({ email });
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    };
  },

  createStructure(root, { type, name, about, location }, context) {
    return context.prisma.createStructure(
      { type, name, about, location: { create: location } },
    );
  },

  deleteStructure(root, { id }, context) {
    return context.prisma.deleteStructure({ id });
  },

  async addImageToStructure(root, { id, file }, context) {
    const image = await processUpload(file, context);

    return context.prisma.updateStructure({
      data: {
        images: {
          connect: {
            id: image.id,
          },
        },
      },
      where: {
        id,
      },
    });
  },

  createEvent(root, { name, about, startAt, endAt, location, structuresId }, context) {
    return context.prisma.createEvent(
      {
        name,
        about,
        startAt,
        endAt,
        location: { create: location },
        structures: structuresId && { set: structuresId },
      },
    );
  },

  deleteEvent(root, { id }, context) {
    return context.prisma.deleteEvent({ id });
  },

  async addImageToEvent(root, { id, file }, context) {
    const { mimetype, createReadStream } = await file;
    const stream = createReadStream();
  
    if (!allowedMimes.includes(mimetype)) {
      throw new Error(`Files of mimetype ${mimetype} are not currently accepted`);
    }
  
    const image = await context.prisma.createImage({ mimetype });
    const extension = mimetype.split('/')[1];
    const name = `${image.id}.${extension}`;
    
    await storeImage(stream, name)
    const { width, height } = sizeOf(resolve(__dirname, '../../static/images', name));
    
    await context.prisma.updateImage({
      data: {
        width, height,
      },
      where: {
        id: image.id,
      },
    });
  
    return await context.prisma.updateEvent({
      data: {
        images: {
          connect: {
            id: image.id,
          },
        },
      },
      where: {
        id,
      },
    });
  },
}

module.exports = {
  Mutation,
};
