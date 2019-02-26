const { rule, and, shield } = require('graphql-shield');
const { getUserId } = require('../utils');

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const userId = getUserId(context);
    return Boolean(userId);
  }),
};

const permissions = shield({
  Query: {
    // me: rules.isAuthenticatedUser,
  },

  Mutation: {
    signup: rules.isAuthenticatedUser,

    createStructure: rules.isAuthenticatedUser,
    deleteStructure: rules.isAuthenticatedUser,
    addImageToStructure: rules.isAuthenticatedUser,

    createEvent: rules.isAuthenticatedUser,
    deleteEvent: rules.isAuthenticatedUser,
    addImageToEvent: rules.isAuthenticatedUser,
  },
});

module.exports = {
  permissions,
};
