"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Event",
    embedded: false
  },
  {
    name: "Game",
    embedded: false
  },
  {
    name: "Image",
    embedded: false
  },
  {
    name: "Location",
    embedded: false
  },
  {
    name: "Person",
    embedded: false
  },
  {
    name: "Structure",
    embedded: false
  },
  {
    name: "StructureType",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://localhost:4466`
});
exports.prisma = new exports.Prisma();
