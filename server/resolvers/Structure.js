const Structure = {
  location(root, args, context) {
    return context.prisma.structure({
      id: root.id,
    }).location();
  },
};

module.exports = {
  Structure,
};
