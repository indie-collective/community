const fs = require('fs');
const { resolve } = require('path');
const { hash, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

// create files dir
fs.access(resolve(__dirname, '../../files'), fs.constants.F_OK, (err) => {
  if (err) {
    fs.mkdir(resolve(__dirname, '../../files'), (err) => {
      if (err) {
        console.log(err)
      }
    });
  }
});

const storeFile = (stream, id) => {
  const path = resolve(__dirname, '../../files', id);

  const ws = fs.createWriteStream(path, {
    autoClose: true,
  });

  return new Promise((resolve, reject) =>
    stream
      .pipe(ws)
      .on('finish', resolve)
      .on('error', reject)
  );
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

  addImageToEvent: async (root, { id, file }, context) => {
    const { mimetype, createReadStream } = await file;
    const stream = createReadStream();

    const image = await context.prisma.createImage({ mimetype });

    await storeFile(stream, id);

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

  addImageToEvent: async (root, { id, file }, context) => {
    const { mimetype, createReadStream } = await file;
    const stream = createReadStream();

    const image = await context.prisma.createImage({ mimetype });

    const ws = fs.createWriteStream(resolve(__dirname, '../../files', image.id), {
      autoClose: true,
    });

    stream.pipe(ws);

    return context.prisma.updateEvent({
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
