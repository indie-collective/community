const { GraphQLServer } = require('graphql-yoga');

const { prisma } = require('./generated/prisma-client');
const { resolvers } = require('./resolvers');
const { permissions } = require('./permissions');

const server = new GraphQLServer({
  typeDefs: './server/schema.graphql',
  resolvers,
  middlewares: [permissions],
  context(request) {
    return {
      ...request,
      prisma,
    };
  },
});

server.start({
  endpoint: '/graphql',
}, () => console.log('Server is running on http://localhost:4000'));
