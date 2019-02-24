const { hash, compare } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { APP_SECRET, getUserId } = require('../utils');

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
}

module.exports = {
  Mutation,
};
