const { Query } = require('./Query');
const { Mutation } = require('./Mutation');
const { Structure } = require('./Structure');
const { Event } = require('./Event');

const resolvers = {
  Query,
  Mutation,
  Structure,
  Event,
};

module.exports = {
  resolvers,
};
