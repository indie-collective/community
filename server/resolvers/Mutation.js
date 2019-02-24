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

  createEvent(root, { name, about, startAt, endAt, location }, context) {
    return context.prisma.createEvent(
      { name, about, startAt, endAt, location: { create: location } },
    );
  },

  deleteEvent(root, { id }, context) {
    return context.prisma.deleteEvent({ id });
  },

  uploadImage: async (root, { file }) => {
    const { filename, mimetype, createReadStream } = await file;
    const stream = createReadStream();

    const ws = fs.createWriteStream(resolve(__dirname, '../../files', filename), {
      autoClose: true,
    });

    stream.pipe(ws);

    return { id: 'NOID', filename, mimetype };
  },
}

module.exports = {
  Mutation,
};
