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
  },

  structures(root, args, context) {
    return context.prisma.event({
      id: root.id,
    }).structures();
  },
};

module.exports = {
  Event,
};
