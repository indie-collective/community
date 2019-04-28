const { Query } = require('./Query');
const { Mutation } = require('./Mutation');
const { Structure } = require('./Structure');
const { Event } = require('./Event');
const { Location } = require('./Location');

const resolvers = {
  Query,
  Mutation,
  Structure,
  Event,
  Location,
};

module.exports = {
  resolvers,
};
