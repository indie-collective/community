const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    allStructures(root, args, context) {
      return context.prisma.structures()
    },
    structure(root, args, context) {
      return context.prisma.structure({ id: args.postId })
    }
  },

  Mutation: {
    createStructure(root, { type, name, about }, context) {
      return context.prisma.createStructure(
        { type, name, about },
      )
    }
  },

  // Structure: {
  //   structures(root, args, context) {
  //     return context.prisma.user({
  //       id: root.id
  //     }).posts()
  //   }
  // }
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma
  },
})

server.start(() => console.log('Server is running on http://localhost:4000'))