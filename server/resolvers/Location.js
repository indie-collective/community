const Location = {
  structures(root, args, context) {
    return context.prisma.location({
      id: root.id,
    }).structures();
  },
};

module.exports = {
  Location,
};
