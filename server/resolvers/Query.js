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
};

module.exports = {
  Query,
};
