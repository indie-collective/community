const { getUserId } = require('../utils');

const Query = {
  me: (parent, args, context) => {
    const userId = getUserId(context)
    return context.prisma.user({ id: userId })
  },

  allStructures(root, args, context) {
    return context.prisma.structures()
  },

  structure(root, { id }, context) {
    return context.prisma.structure({ id })
  },

  allEvents(root, args, context) {
    return context.prisma.events({ orderBy: 'startAt_ASC' })
  },

  event(root, { id }, context) {
    return context.prisma.event({ id })
  },
};

module.exports = {
  Query,
};
