const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    allStructures(root, args, context) {
      return context.prisma.structures()
    },
    structure(root, { id }, context) {
      return context.prisma.structure({ id })
    }
  },

  Mutation: {
    createStructure(root, { type, name, about, location }, context) {
      return context.prisma.createStructure(
        { type, name, about, location: { create: location } },
      )
    }
  },

  Structure: {
    location(root, args, context) {
      return context.prisma.structure({
        id: root.id
      }).location()
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './server/schema.graphql',
  resolvers,
  context: {
    prisma
  },
})

server.start(() => console.log('Server is running on http://localhost:4000'))