const Event = {
  location(root, args, context) {
    return context.prisma.event({
      id: root.id,
    }).location();
  },

  images(root, args, context) {
    return context.prisma.event({
      id: root.id,
    }).images();
  }
};

module.exports = {
  Event,
};
