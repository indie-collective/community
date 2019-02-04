const { Query } = require('./Query');
const { Mutation } = require('./Mutation');
const { Structure } = require('./Structure');

const resolvers = {
  Query,
  Mutation,
  Structure,
};

module.exports = {
  resolvers,
};
