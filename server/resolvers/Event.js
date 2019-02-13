const Event = {
  location(root, args, context) {
    return context.prisma.event({
      id: root.id,
    }).location();
  },
};

module.exports = {
  Event,
};
