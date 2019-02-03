module.exports = {
        typeDefs: /* GraphQL */ `type AggregateEvent {
  count: Int!
}

type AggregateGame {
  count: Int!
}

type AggregateImage {
  count: Int!
}

type AggregateLocation {
  count: Int!
}

type AggregatePerson {
  count: Int!
}

type AggregateStructure {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type BatchPayload {
  count: Long!
}

scalar DateTime

type Event {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  location: Location
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image!]
  authors(where: PersonWhereInput, orderBy: PersonOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Person!]
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure!]
  games(where: GameWhereInput, orderBy: GameOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Game!]
}

type EventConnection {
  pageInfo: PageInfo!
  edges: [EventEdge]!
  aggregate: AggregateEvent!
}

input EventCreateInput {
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  location: LocationCreateOneWithoutEventsInput
  images: ImageCreateManyInput
  authors: PersonCreateManyWithoutEventsInput
  structures: StructureCreateManyWithoutEventsInput
  games: GameCreateManyWithoutEventsInput
}

input EventCreateManyWithoutAuthorsInput {
  create: [EventCreateWithoutAuthorsInput!]
  connect: [EventWhereUniqueInput!]
}

input EventCreateManyWithoutGamesInput {
  create: [EventCreateWithoutGamesInput!]
  connect: [EventWhereUniqueInput!]
}

input EventCreateManyWithoutLocationInput {
  create: [EventCreateWithoutLocationInput!]
  connect: [EventWhereUniqueInput!]
}

input EventCreateManyWithoutStructuresInput {
  create: [EventCreateWithoutStructuresInput!]
  connect: [EventWhereUniqueInput!]
}

input EventCreateWithoutAuthorsInput {
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  location: LocationCreateOneWithoutEventsInput
  images: ImageCreateManyInput
  structures: StructureCreateManyWithoutEventsInput
  games: GameCreateManyWithoutEventsInput
}

input EventCreateWithoutGamesInput {
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  location: LocationCreateOneWithoutEventsInput
  images: ImageCreateManyInput
  authors: PersonCreateManyWithoutEventsInput
  structures: StructureCreateManyWithoutEventsInput
}

input EventCreateWithoutLocationInput {
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  images: ImageCreateManyInput
  authors: PersonCreateManyWithoutEventsInput
  structures: StructureCreateManyWithoutEventsInput
  games: GameCreateManyWithoutEventsInput
}

input EventCreateWithoutStructuresInput {
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
  location: LocationCreateOneWithoutEventsInput
  images: ImageCreateManyInput
  authors: PersonCreateManyWithoutEventsInput
  games: GameCreateManyWithoutEventsInput
}

type EventEdge {
  node: Event!
  cursor: String!
}

enum EventOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  name_ASC
  name_DESC
  about_ASC
  about_DESC
  start_ASC
  start_DESC
  end_ASC
  end_DESC
}

type EventPreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
  about: String!
  start: DateTime!
  end: DateTime!
}

input EventScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  start: DateTime
  start_not: DateTime
  start_in: [DateTime!]
  start_not_in: [DateTime!]
  start_lt: DateTime
  start_lte: DateTime
  start_gt: DateTime
  start_gte: DateTime
  end: DateTime
  end_not: DateTime
  end_in: [DateTime!]
  end_not_in: [DateTime!]
  end_lt: DateTime
  end_lte: DateTime
  end_gt: DateTime
  end_gte: DateTime
  AND: [EventScalarWhereInput!]
  OR: [EventScalarWhereInput!]
  NOT: [EventScalarWhereInput!]
}

type EventSubscriptionPayload {
  mutation: MutationType!
  node: Event
  updatedFields: [String!]
  previousValues: EventPreviousValues
}

input EventSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: EventWhereInput
  AND: [EventSubscriptionWhereInput!]
  OR: [EventSubscriptionWhereInput!]
  NOT: [EventSubscriptionWhereInput!]
}

input EventUpdateInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
  location: LocationUpdateOneWithoutEventsInput
  images: ImageUpdateManyInput
  authors: PersonUpdateManyWithoutEventsInput
  structures: StructureUpdateManyWithoutEventsInput
  games: GameUpdateManyWithoutEventsInput
}

input EventUpdateManyDataInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
}

input EventUpdateManyMutationInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
}

input EventUpdateManyWithoutAuthorsInput {
  create: [EventCreateWithoutAuthorsInput!]
  delete: [EventWhereUniqueInput!]
  connect: [EventWhereUniqueInput!]
  disconnect: [EventWhereUniqueInput!]
  update: [EventUpdateWithWhereUniqueWithoutAuthorsInput!]
  upsert: [EventUpsertWithWhereUniqueWithoutAuthorsInput!]
  deleteMany: [EventScalarWhereInput!]
  updateMany: [EventUpdateManyWithWhereNestedInput!]
}

input EventUpdateManyWithoutGamesInput {
  create: [EventCreateWithoutGamesInput!]
  delete: [EventWhereUniqueInput!]
  connect: [EventWhereUniqueInput!]
  disconnect: [EventWhereUniqueInput!]
  update: [EventUpdateWithWhereUniqueWithoutGamesInput!]
  upsert: [EventUpsertWithWhereUniqueWithoutGamesInput!]
  deleteMany: [EventScalarWhereInput!]
  updateMany: [EventUpdateManyWithWhereNestedInput!]
}

input EventUpdateManyWithoutLocationInput {
  create: [EventCreateWithoutLocationInput!]
  delete: [EventWhereUniqueInput!]
  connect: [EventWhereUniqueInput!]
  disconnect: [EventWhereUniqueInput!]
  update: [EventUpdateWithWhereUniqueWithoutLocationInput!]
  upsert: [EventUpsertWithWhereUniqueWithoutLocationInput!]
  deleteMany: [EventScalarWhereInput!]
  updateMany: [EventUpdateManyWithWhereNestedInput!]
}

input EventUpdateManyWithoutStructuresInput {
  create: [EventCreateWithoutStructuresInput!]
  delete: [EventWhereUniqueInput!]
  connect: [EventWhereUniqueInput!]
  disconnect: [EventWhereUniqueInput!]
  update: [EventUpdateWithWhereUniqueWithoutStructuresInput!]
  upsert: [EventUpsertWithWhereUniqueWithoutStructuresInput!]
  deleteMany: [EventScalarWhereInput!]
  updateMany: [EventUpdateManyWithWhereNestedInput!]
}

input EventUpdateManyWithWhereNestedInput {
  where: EventScalarWhereInput!
  data: EventUpdateManyDataInput!
}

input EventUpdateWithoutAuthorsDataInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
  location: LocationUpdateOneWithoutEventsInput
  images: ImageUpdateManyInput
  structures: StructureUpdateManyWithoutEventsInput
  games: GameUpdateManyWithoutEventsInput
}

input EventUpdateWithoutGamesDataInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
  location: LocationUpdateOneWithoutEventsInput
  images: ImageUpdateManyInput
  authors: PersonUpdateManyWithoutEventsInput
  structures: StructureUpdateManyWithoutEventsInput
}

input EventUpdateWithoutLocationDataInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
  images: ImageUpdateManyInput
  authors: PersonUpdateManyWithoutEventsInput
  structures: StructureUpdateManyWithoutEventsInput
  games: GameUpdateManyWithoutEventsInput
}

input EventUpdateWithoutStructuresDataInput {
  name: String
  about: String
  start: DateTime
  end: DateTime
  location: LocationUpdateOneWithoutEventsInput
  images: ImageUpdateManyInput
  authors: PersonUpdateManyWithoutEventsInput
  games: GameUpdateManyWithoutEventsInput
}

input EventUpdateWithWhereUniqueWithoutAuthorsInput {
  where: EventWhereUniqueInput!
  data: EventUpdateWithoutAuthorsDataInput!
}

input EventUpdateWithWhereUniqueWithoutGamesInput {
  where: EventWhereUniqueInput!
  data: EventUpdateWithoutGamesDataInput!
}

input EventUpdateWithWhereUniqueWithoutLocationInput {
  where: EventWhereUniqueInput!
  data: EventUpdateWithoutLocationDataInput!
}

input EventUpdateWithWhereUniqueWithoutStructuresInput {
  where: EventWhereUniqueInput!
  data: EventUpdateWithoutStructuresDataInput!
}

input EventUpsertWithWhereUniqueWithoutAuthorsInput {
  where: EventWhereUniqueInput!
  update: EventUpdateWithoutAuthorsDataInput!
  create: EventCreateWithoutAuthorsInput!
}

input EventUpsertWithWhereUniqueWithoutGamesInput {
  where: EventWhereUniqueInput!
  update: EventUpdateWithoutGamesDataInput!
  create: EventCreateWithoutGamesInput!
}

input EventUpsertWithWhereUniqueWithoutLocationInput {
  where: EventWhereUniqueInput!
  update: EventUpdateWithoutLocationDataInput!
  create: EventCreateWithoutLocationInput!
}

input EventUpsertWithWhereUniqueWithoutStructuresInput {
  where: EventWhereUniqueInput!
  update: EventUpdateWithoutStructuresDataInput!
  create: EventCreateWithoutStructuresInput!
}

input EventWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  start: DateTime
  start_not: DateTime
  start_in: [DateTime!]
  start_not_in: [DateTime!]
  start_lt: DateTime
  start_lte: DateTime
  start_gt: DateTime
  start_gte: DateTime
  end: DateTime
  end_not: DateTime
  end_in: [DateTime!]
  end_not_in: [DateTime!]
  end_lt: DateTime
  end_lte: DateTime
  end_gt: DateTime
  end_gte: DateTime
  location: LocationWhereInput
  images_every: ImageWhereInput
  images_some: ImageWhereInput
  images_none: ImageWhereInput
  authors_every: PersonWhereInput
  authors_some: PersonWhereInput
  authors_none: PersonWhereInput
  structures_every: StructureWhereInput
  structures_some: StructureWhereInput
  structures_none: StructureWhereInput
  games_every: GameWhereInput
  games_some: GameWhereInput
  games_none: GameWhereInput
  AND: [EventWhereInput!]
  OR: [EventWhereInput!]
  NOT: [EventWhereInput!]
}

input EventWhereUniqueInput {
  id: ID
}

type Game {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  releasedAt: DateTime
  name: String!
  about: String!
  authors(where: PersonWhereInput, orderBy: PersonOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Person!]
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure!]
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image!]
  events(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Event!]
}

type GameConnection {
  pageInfo: PageInfo!
  edges: [GameEdge]!
  aggregate: AggregateGame!
}

input GameCreateInput {
  releasedAt: DateTime
  name: String!
  about: String!
  authors: PersonCreateManyWithoutGamesInput
  structures: StructureCreateManyWithoutGamesInput
  images: ImageCreateManyInput
  events: EventCreateManyWithoutGamesInput
}

input GameCreateManyWithoutAuthorsInput {
  create: [GameCreateWithoutAuthorsInput!]
  connect: [GameWhereUniqueInput!]
}

input GameCreateManyWithoutEventsInput {
  create: [GameCreateWithoutEventsInput!]
  connect: [GameWhereUniqueInput!]
}

input GameCreateManyWithoutStructuresInput {
  create: [GameCreateWithoutStructuresInput!]
  connect: [GameWhereUniqueInput!]
}

input GameCreateWithoutAuthorsInput {
  releasedAt: DateTime
  name: String!
  about: String!
  structures: StructureCreateManyWithoutGamesInput
  images: ImageCreateManyInput
  events: EventCreateManyWithoutGamesInput
}

input GameCreateWithoutEventsInput {
  releasedAt: DateTime
  name: String!
  about: String!
  authors: PersonCreateManyWithoutGamesInput
  structures: StructureCreateManyWithoutGamesInput
  images: ImageCreateManyInput
}

input GameCreateWithoutStructuresInput {
  releasedAt: DateTime
  name: String!
  about: String!
  authors: PersonCreateManyWithoutGamesInput
  images: ImageCreateManyInput
  events: EventCreateManyWithoutGamesInput
}

type GameEdge {
  node: Game!
  cursor: String!
}

enum GameOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  releasedAt_ASC
  releasedAt_DESC
  name_ASC
  name_DESC
  about_ASC
  about_DESC
}

type GamePreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  releasedAt: DateTime
  name: String!
  about: String!
}

input GameScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  releasedAt: DateTime
  releasedAt_not: DateTime
  releasedAt_in: [DateTime!]
  releasedAt_not_in: [DateTime!]
  releasedAt_lt: DateTime
  releasedAt_lte: DateTime
  releasedAt_gt: DateTime
  releasedAt_gte: DateTime
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  AND: [GameScalarWhereInput!]
  OR: [GameScalarWhereInput!]
  NOT: [GameScalarWhereInput!]
}

type GameSubscriptionPayload {
  mutation: MutationType!
  node: Game
  updatedFields: [String!]
  previousValues: GamePreviousValues
}

input GameSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: GameWhereInput
  AND: [GameSubscriptionWhereInput!]
  OR: [GameSubscriptionWhereInput!]
  NOT: [GameSubscriptionWhereInput!]
}

input GameUpdateInput {
  releasedAt: DateTime
  name: String
  about: String
  authors: PersonUpdateManyWithoutGamesInput
  structures: StructureUpdateManyWithoutGamesInput
  images: ImageUpdateManyInput
  events: EventUpdateManyWithoutGamesInput
}

input GameUpdateManyDataInput {
  releasedAt: DateTime
  name: String
  about: String
}

input GameUpdateManyMutationInput {
  releasedAt: DateTime
  name: String
  about: String
}

input GameUpdateManyWithoutAuthorsInput {
  create: [GameCreateWithoutAuthorsInput!]
  delete: [GameWhereUniqueInput!]
  connect: [GameWhereUniqueInput!]
  disconnect: [GameWhereUniqueInput!]
  update: [GameUpdateWithWhereUniqueWithoutAuthorsInput!]
  upsert: [GameUpsertWithWhereUniqueWithoutAuthorsInput!]
  deleteMany: [GameScalarWhereInput!]
  updateMany: [GameUpdateManyWithWhereNestedInput!]
}

input GameUpdateManyWithoutEventsInput {
  create: [GameCreateWithoutEventsInput!]
  delete: [GameWhereUniqueInput!]
  connect: [GameWhereUniqueInput!]
  disconnect: [GameWhereUniqueInput!]
  update: [GameUpdateWithWhereUniqueWithoutEventsInput!]
  upsert: [GameUpsertWithWhereUniqueWithoutEventsInput!]
  deleteMany: [GameScalarWhereInput!]
  updateMany: [GameUpdateManyWithWhereNestedInput!]
}

input GameUpdateManyWithoutStructuresInput {
  create: [GameCreateWithoutStructuresInput!]
  delete: [GameWhereUniqueInput!]
  connect: [GameWhereUniqueInput!]
  disconnect: [GameWhereUniqueInput!]
  update: [GameUpdateWithWhereUniqueWithoutStructuresInput!]
  upsert: [GameUpsertWithWhereUniqueWithoutStructuresInput!]
  deleteMany: [GameScalarWhereInput!]
  updateMany: [GameUpdateManyWithWhereNestedInput!]
}

input GameUpdateManyWithWhereNestedInput {
  where: GameScalarWhereInput!
  data: GameUpdateManyDataInput!
}

input GameUpdateWithoutAuthorsDataInput {
  releasedAt: DateTime
  name: String
  about: String
  structures: StructureUpdateManyWithoutGamesInput
  images: ImageUpdateManyInput
  events: EventUpdateManyWithoutGamesInput
}

input GameUpdateWithoutEventsDataInput {
  releasedAt: DateTime
  name: String
  about: String
  authors: PersonUpdateManyWithoutGamesInput
  structures: StructureUpdateManyWithoutGamesInput
  images: ImageUpdateManyInput
}

input GameUpdateWithoutStructuresDataInput {
  releasedAt: DateTime
  name: String
  about: String
  authors: PersonUpdateManyWithoutGamesInput
  images: ImageUpdateManyInput
  events: EventUpdateManyWithoutGamesInput
}

input GameUpdateWithWhereUniqueWithoutAuthorsInput {
  where: GameWhereUniqueInput!
  data: GameUpdateWithoutAuthorsDataInput!
}

input GameUpdateWithWhereUniqueWithoutEventsInput {
  where: GameWhereUniqueInput!
  data: GameUpdateWithoutEventsDataInput!
}

input GameUpdateWithWhereUniqueWithoutStructuresInput {
  where: GameWhereUniqueInput!
  data: GameUpdateWithoutStructuresDataInput!
}

input GameUpsertWithWhereUniqueWithoutAuthorsInput {
  where: GameWhereUniqueInput!
  update: GameUpdateWithoutAuthorsDataInput!
  create: GameCreateWithoutAuthorsInput!
}

input GameUpsertWithWhereUniqueWithoutEventsInput {
  where: GameWhereUniqueInput!
  update: GameUpdateWithoutEventsDataInput!
  create: GameCreateWithoutEventsInput!
}

input GameUpsertWithWhereUniqueWithoutStructuresInput {
  where: GameWhereUniqueInput!
  update: GameUpdateWithoutStructuresDataInput!
  create: GameCreateWithoutStructuresInput!
}

input GameWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  releasedAt: DateTime
  releasedAt_not: DateTime
  releasedAt_in: [DateTime!]
  releasedAt_not_in: [DateTime!]
  releasedAt_lt: DateTime
  releasedAt_lte: DateTime
  releasedAt_gt: DateTime
  releasedAt_gte: DateTime
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  authors_every: PersonWhereInput
  authors_some: PersonWhereInput
  authors_none: PersonWhereInput
  structures_every: StructureWhereInput
  structures_some: StructureWhereInput
  structures_none: StructureWhereInput
  images_every: ImageWhereInput
  images_some: ImageWhereInput
  images_none: ImageWhereInput
  events_every: EventWhereInput
  events_some: EventWhereInput
  events_none: EventWhereInput
  AND: [GameWhereInput!]
  OR: [GameWhereInput!]
  NOT: [GameWhereInput!]
}

input GameWhereUniqueInput {
  id: ID
}

type Image {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  filename: String!
  mimetype: String!
}

type ImageConnection {
  pageInfo: PageInfo!
  edges: [ImageEdge]!
  aggregate: AggregateImage!
}

input ImageCreateInput {
  filename: String!
  mimetype: String!
}

input ImageCreateManyInput {
  create: [ImageCreateInput!]
  connect: [ImageWhereUniqueInput!]
}

type ImageEdge {
  node: Image!
  cursor: String!
}

enum ImageOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  filename_ASC
  filename_DESC
  mimetype_ASC
  mimetype_DESC
}

type ImagePreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  filename: String!
  mimetype: String!
}

input ImageScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  filename: String
  filename_not: String
  filename_in: [String!]
  filename_not_in: [String!]
  filename_lt: String
  filename_lte: String
  filename_gt: String
  filename_gte: String
  filename_contains: String
  filename_not_contains: String
  filename_starts_with: String
  filename_not_starts_with: String
  filename_ends_with: String
  filename_not_ends_with: String
  mimetype: String
  mimetype_not: String
  mimetype_in: [String!]
  mimetype_not_in: [String!]
  mimetype_lt: String
  mimetype_lte: String
  mimetype_gt: String
  mimetype_gte: String
  mimetype_contains: String
  mimetype_not_contains: String
  mimetype_starts_with: String
  mimetype_not_starts_with: String
  mimetype_ends_with: String
  mimetype_not_ends_with: String
  AND: [ImageScalarWhereInput!]
  OR: [ImageScalarWhereInput!]
  NOT: [ImageScalarWhereInput!]
}

type ImageSubscriptionPayload {
  mutation: MutationType!
  node: Image
  updatedFields: [String!]
  previousValues: ImagePreviousValues
}

input ImageSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ImageWhereInput
  AND: [ImageSubscriptionWhereInput!]
  OR: [ImageSubscriptionWhereInput!]
  NOT: [ImageSubscriptionWhereInput!]
}

input ImageUpdateDataInput {
  filename: String
  mimetype: String
}

input ImageUpdateInput {
  filename: String
  mimetype: String
}

input ImageUpdateManyDataInput {
  filename: String
  mimetype: String
}

input ImageUpdateManyInput {
  create: [ImageCreateInput!]
  update: [ImageUpdateWithWhereUniqueNestedInput!]
  upsert: [ImageUpsertWithWhereUniqueNestedInput!]
  delete: [ImageWhereUniqueInput!]
  connect: [ImageWhereUniqueInput!]
  disconnect: [ImageWhereUniqueInput!]
  deleteMany: [ImageScalarWhereInput!]
  updateMany: [ImageUpdateManyWithWhereNestedInput!]
}

input ImageUpdateManyMutationInput {
  filename: String
  mimetype: String
}

input ImageUpdateManyWithWhereNestedInput {
  where: ImageScalarWhereInput!
  data: ImageUpdateManyDataInput!
}

input ImageUpdateWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput!
  data: ImageUpdateDataInput!
}

input ImageUpsertWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput!
  update: ImageUpdateDataInput!
  create: ImageCreateInput!
}

input ImageWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  filename: String
  filename_not: String
  filename_in: [String!]
  filename_not_in: [String!]
  filename_lt: String
  filename_lte: String
  filename_gt: String
  filename_gte: String
  filename_contains: String
  filename_not_contains: String
  filename_starts_with: String
  filename_not_starts_with: String
  filename_ends_with: String
  filename_not_ends_with: String
  mimetype: String
  mimetype_not: String
  mimetype_in: [String!]
  mimetype_not_in: [String!]
  mimetype_lt: String
  mimetype_lte: String
  mimetype_gt: String
  mimetype_gte: String
  mimetype_contains: String
  mimetype_not_contains: String
  mimetype_starts_with: String
  mimetype_not_starts_with: String
  mimetype_ends_with: String
  mimetype_not_ends_with: String
  AND: [ImageWhereInput!]
  OR: [ImageWhereInput!]
  NOT: [ImageWhereInput!]
}

input ImageWhereUniqueInput {
  id: ID
}

type Location {
  country: String!
  city: String!
  latitude: Float!
  longitude: Float!
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure!]
  events(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Event!]
}

type LocationConnection {
  pageInfo: PageInfo!
  edges: [LocationEdge]!
  aggregate: AggregateLocation!
}

input LocationCreateInput {
  country: String!
  city: String!
  latitude: Float!
  longitude: Float!
  structures: StructureCreateManyWithoutLocationInput
  events: EventCreateManyWithoutLocationInput
}

input LocationCreateOneWithoutEventsInput {
  create: LocationCreateWithoutEventsInput
}

input LocationCreateOneWithoutStructuresInput {
  create: LocationCreateWithoutStructuresInput
}

input LocationCreateWithoutEventsInput {
  country: String!
  city: String!
  latitude: Float!
  longitude: Float!
  structures: StructureCreateManyWithoutLocationInput
}

input LocationCreateWithoutStructuresInput {
  country: String!
  city: String!
  latitude: Float!
  longitude: Float!
  events: EventCreateManyWithoutLocationInput
}

type LocationEdge {
  node: Location!
  cursor: String!
}

enum LocationOrderByInput {
  country_ASC
  country_DESC
  city_ASC
  city_DESC
  latitude_ASC
  latitude_DESC
  longitude_ASC
  longitude_DESC
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type LocationPreviousValues {
  country: String!
  city: String!
  latitude: Float!
  longitude: Float!
}

type LocationSubscriptionPayload {
  mutation: MutationType!
  node: Location
  updatedFields: [String!]
  previousValues: LocationPreviousValues
}

input LocationSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: LocationWhereInput
  AND: [LocationSubscriptionWhereInput!]
  OR: [LocationSubscriptionWhereInput!]
  NOT: [LocationSubscriptionWhereInput!]
}

input LocationUpdateManyMutationInput {
  country: String
  city: String
  latitude: Float
  longitude: Float
}

input LocationUpdateOneRequiredWithoutStructuresInput {
  create: LocationCreateWithoutStructuresInput
  update: LocationUpdateWithoutStructuresDataInput
  upsert: LocationUpsertWithoutStructuresInput
}

input LocationUpdateOneWithoutEventsInput {
  create: LocationCreateWithoutEventsInput
  update: LocationUpdateWithoutEventsDataInput
  upsert: LocationUpsertWithoutEventsInput
  delete: Boolean
  disconnect: Boolean
}

input LocationUpdateWithoutEventsDataInput {
  country: String
  city: String
  latitude: Float
  longitude: Float
  structures: StructureUpdateManyWithoutLocationInput
}

input LocationUpdateWithoutStructuresDataInput {
  country: String
  city: String
  latitude: Float
  longitude: Float
  events: EventUpdateManyWithoutLocationInput
}

input LocationUpsertWithoutEventsInput {
  update: LocationUpdateWithoutEventsDataInput!
  create: LocationCreateWithoutEventsInput!
}

input LocationUpsertWithoutStructuresInput {
  update: LocationUpdateWithoutStructuresDataInput!
  create: LocationCreateWithoutStructuresInput!
}

input LocationWhereInput {
  country: String
  country_not: String
  country_in: [String!]
  country_not_in: [String!]
  country_lt: String
  country_lte: String
  country_gt: String
  country_gte: String
  country_contains: String
  country_not_contains: String
  country_starts_with: String
  country_not_starts_with: String
  country_ends_with: String
  country_not_ends_with: String
  city: String
  city_not: String
  city_in: [String!]
  city_not_in: [String!]
  city_lt: String
  city_lte: String
  city_gt: String
  city_gte: String
  city_contains: String
  city_not_contains: String
  city_starts_with: String
  city_not_starts_with: String
  city_ends_with: String
  city_not_ends_with: String
  latitude: Float
  latitude_not: Float
  latitude_in: [Float!]
  latitude_not_in: [Float!]
  latitude_lt: Float
  latitude_lte: Float
  latitude_gt: Float
  latitude_gte: Float
  longitude: Float
  longitude_not: Float
  longitude_in: [Float!]
  longitude_not_in: [Float!]
  longitude_lt: Float
  longitude_lte: Float
  longitude_gt: Float
  longitude_gte: Float
  structures_every: StructureWhereInput
  structures_some: StructureWhereInput
  structures_none: StructureWhereInput
  events_every: EventWhereInput
  events_some: EventWhereInput
  events_none: EventWhereInput
  AND: [LocationWhereInput!]
  OR: [LocationWhereInput!]
  NOT: [LocationWhereInput!]
}

scalar Long

type Mutation {
  createEvent(data: EventCreateInput!): Event!
  updateEvent(data: EventUpdateInput!, where: EventWhereUniqueInput!): Event
  updateManyEvents(data: EventUpdateManyMutationInput!, where: EventWhereInput): BatchPayload!
  upsertEvent(where: EventWhereUniqueInput!, create: EventCreateInput!, update: EventUpdateInput!): Event!
  deleteEvent(where: EventWhereUniqueInput!): Event
  deleteManyEvents(where: EventWhereInput): BatchPayload!
  createGame(data: GameCreateInput!): Game!
  updateGame(data: GameUpdateInput!, where: GameWhereUniqueInput!): Game
  updateManyGames(data: GameUpdateManyMutationInput!, where: GameWhereInput): BatchPayload!
  upsertGame(where: GameWhereUniqueInput!, create: GameCreateInput!, update: GameUpdateInput!): Game!
  deleteGame(where: GameWhereUniqueInput!): Game
  deleteManyGames(where: GameWhereInput): BatchPayload!
  createImage(data: ImageCreateInput!): Image!
  updateImage(data: ImageUpdateInput!, where: ImageWhereUniqueInput!): Image
  updateManyImages(data: ImageUpdateManyMutationInput!, where: ImageWhereInput): BatchPayload!
  upsertImage(where: ImageWhereUniqueInput!, create: ImageCreateInput!, update: ImageUpdateInput!): Image!
  deleteImage(where: ImageWhereUniqueInput!): Image
  deleteManyImages(where: ImageWhereInput): BatchPayload!
  createLocation(data: LocationCreateInput!): Location!
  updateManyLocations(data: LocationUpdateManyMutationInput!, where: LocationWhereInput): BatchPayload!
  deleteManyLocations(where: LocationWhereInput): BatchPayload!
  createPerson(data: PersonCreateInput!): Person!
  updatePerson(data: PersonUpdateInput!, where: PersonWhereUniqueInput!): Person
  updateManyPersons(data: PersonUpdateManyMutationInput!, where: PersonWhereInput): BatchPayload!
  upsertPerson(where: PersonWhereUniqueInput!, create: PersonCreateInput!, update: PersonUpdateInput!): Person!
  deletePerson(where: PersonWhereUniqueInput!): Person
  deleteManyPersons(where: PersonWhereInput): BatchPayload!
  createStructure(data: StructureCreateInput!): Structure!
  updateStructure(data: StructureUpdateInput!, where: StructureWhereUniqueInput!): Structure
  updateManyStructures(data: StructureUpdateManyMutationInput!, where: StructureWhereInput): BatchPayload!
  upsertStructure(where: StructureWhereUniqueInput!, create: StructureCreateInput!, update: StructureUpdateInput!): Structure!
  deleteStructure(where: StructureWhereUniqueInput!): Structure
  deleteManyStructures(where: StructureWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Person {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  user: User
  name: String!
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure!]
  games(where: GameWhereInput, orderBy: GameOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Game!]
  events(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Event!]
}

type PersonConnection {
  pageInfo: PageInfo!
  edges: [PersonEdge]!
  aggregate: AggregatePerson!
}

input PersonCreateInput {
  user: UserCreateOneWithoutPersonInput
  name: String!
  structures: StructureCreateManyWithoutPeopleInput
  games: GameCreateManyWithoutAuthorsInput
  events: EventCreateManyWithoutAuthorsInput
}

input PersonCreateManyWithoutEventsInput {
  create: [PersonCreateWithoutEventsInput!]
  connect: [PersonWhereUniqueInput!]
}

input PersonCreateManyWithoutGamesInput {
  create: [PersonCreateWithoutGamesInput!]
  connect: [PersonWhereUniqueInput!]
}

input PersonCreateManyWithoutStructuresInput {
  create: [PersonCreateWithoutStructuresInput!]
  connect: [PersonWhereUniqueInput!]
}

input PersonCreateOneWithoutUserInput {
  create: PersonCreateWithoutUserInput
  connect: PersonWhereUniqueInput
}

input PersonCreateWithoutEventsInput {
  user: UserCreateOneWithoutPersonInput
  name: String!
  structures: StructureCreateManyWithoutPeopleInput
  games: GameCreateManyWithoutAuthorsInput
}

input PersonCreateWithoutGamesInput {
  user: UserCreateOneWithoutPersonInput
  name: String!
  structures: StructureCreateManyWithoutPeopleInput
  events: EventCreateManyWithoutAuthorsInput
}

input PersonCreateWithoutStructuresInput {
  user: UserCreateOneWithoutPersonInput
  name: String!
  games: GameCreateManyWithoutAuthorsInput
  events: EventCreateManyWithoutAuthorsInput
}

input PersonCreateWithoutUserInput {
  name: String!
  structures: StructureCreateManyWithoutPeopleInput
  games: GameCreateManyWithoutAuthorsInput
  events: EventCreateManyWithoutAuthorsInput
}

type PersonEdge {
  node: Person!
  cursor: String!
}

enum PersonOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  name_ASC
  name_DESC
}

type PersonPreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  name: String!
}

input PersonScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  AND: [PersonScalarWhereInput!]
  OR: [PersonScalarWhereInput!]
  NOT: [PersonScalarWhereInput!]
}

type PersonSubscriptionPayload {
  mutation: MutationType!
  node: Person
  updatedFields: [String!]
  previousValues: PersonPreviousValues
}

input PersonSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PersonWhereInput
  AND: [PersonSubscriptionWhereInput!]
  OR: [PersonSubscriptionWhereInput!]
  NOT: [PersonSubscriptionWhereInput!]
}

input PersonUpdateInput {
  user: UserUpdateOneWithoutPersonInput
  name: String
  structures: StructureUpdateManyWithoutPeopleInput
  games: GameUpdateManyWithoutAuthorsInput
  events: EventUpdateManyWithoutAuthorsInput
}

input PersonUpdateManyDataInput {
  name: String
}

input PersonUpdateManyMutationInput {
  name: String
}

input PersonUpdateManyWithoutEventsInput {
  create: [PersonCreateWithoutEventsInput!]
  delete: [PersonWhereUniqueInput!]
  connect: [PersonWhereUniqueInput!]
  disconnect: [PersonWhereUniqueInput!]
  update: [PersonUpdateWithWhereUniqueWithoutEventsInput!]
  upsert: [PersonUpsertWithWhereUniqueWithoutEventsInput!]
  deleteMany: [PersonScalarWhereInput!]
  updateMany: [PersonUpdateManyWithWhereNestedInput!]
}

input PersonUpdateManyWithoutGamesInput {
  create: [PersonCreateWithoutGamesInput!]
  delete: [PersonWhereUniqueInput!]
  connect: [PersonWhereUniqueInput!]
  disconnect: [PersonWhereUniqueInput!]
  update: [PersonUpdateWithWhereUniqueWithoutGamesInput!]
  upsert: [PersonUpsertWithWhereUniqueWithoutGamesInput!]
  deleteMany: [PersonScalarWhereInput!]
  updateMany: [PersonUpdateManyWithWhereNestedInput!]
}

input PersonUpdateManyWithoutStructuresInput {
  create: [PersonCreateWithoutStructuresInput!]
  delete: [PersonWhereUniqueInput!]
  connect: [PersonWhereUniqueInput!]
  disconnect: [PersonWhereUniqueInput!]
  update: [PersonUpdateWithWhereUniqueWithoutStructuresInput!]
  upsert: [PersonUpsertWithWhereUniqueWithoutStructuresInput!]
  deleteMany: [PersonScalarWhereInput!]
  updateMany: [PersonUpdateManyWithWhereNestedInput!]
}

input PersonUpdateManyWithWhereNestedInput {
  where: PersonScalarWhereInput!
  data: PersonUpdateManyDataInput!
}

input PersonUpdateOneWithoutUserInput {
  create: PersonCreateWithoutUserInput
  update: PersonUpdateWithoutUserDataInput
  upsert: PersonUpsertWithoutUserInput
  delete: Boolean
  disconnect: Boolean
  connect: PersonWhereUniqueInput
}

input PersonUpdateWithoutEventsDataInput {
  user: UserUpdateOneWithoutPersonInput
  name: String
  structures: StructureUpdateManyWithoutPeopleInput
  games: GameUpdateManyWithoutAuthorsInput
}

input PersonUpdateWithoutGamesDataInput {
  user: UserUpdateOneWithoutPersonInput
  name: String
  structures: StructureUpdateManyWithoutPeopleInput
  events: EventUpdateManyWithoutAuthorsInput
}

input PersonUpdateWithoutStructuresDataInput {
  user: UserUpdateOneWithoutPersonInput
  name: String
  games: GameUpdateManyWithoutAuthorsInput
  events: EventUpdateManyWithoutAuthorsInput
}

input PersonUpdateWithoutUserDataInput {
  name: String
  structures: StructureUpdateManyWithoutPeopleInput
  games: GameUpdateManyWithoutAuthorsInput
  events: EventUpdateManyWithoutAuthorsInput
}

input PersonUpdateWithWhereUniqueWithoutEventsInput {
  where: PersonWhereUniqueInput!
  data: PersonUpdateWithoutEventsDataInput!
}

input PersonUpdateWithWhereUniqueWithoutGamesInput {
  where: PersonWhereUniqueInput!
  data: PersonUpdateWithoutGamesDataInput!
}

input PersonUpdateWithWhereUniqueWithoutStructuresInput {
  where: PersonWhereUniqueInput!
  data: PersonUpdateWithoutStructuresDataInput!
}

input PersonUpsertWithoutUserInput {
  update: PersonUpdateWithoutUserDataInput!
  create: PersonCreateWithoutUserInput!
}

input PersonUpsertWithWhereUniqueWithoutEventsInput {
  where: PersonWhereUniqueInput!
  update: PersonUpdateWithoutEventsDataInput!
  create: PersonCreateWithoutEventsInput!
}

input PersonUpsertWithWhereUniqueWithoutGamesInput {
  where: PersonWhereUniqueInput!
  update: PersonUpdateWithoutGamesDataInput!
  create: PersonCreateWithoutGamesInput!
}

input PersonUpsertWithWhereUniqueWithoutStructuresInput {
  where: PersonWhereUniqueInput!
  update: PersonUpdateWithoutStructuresDataInput!
  create: PersonCreateWithoutStructuresInput!
}

input PersonWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  user: UserWhereInput
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  structures_every: StructureWhereInput
  structures_some: StructureWhereInput
  structures_none: StructureWhereInput
  games_every: GameWhereInput
  games_some: GameWhereInput
  games_none: GameWhereInput
  events_every: EventWhereInput
  events_some: EventWhereInput
  events_none: EventWhereInput
  AND: [PersonWhereInput!]
  OR: [PersonWhereInput!]
  NOT: [PersonWhereInput!]
}

input PersonWhereUniqueInput {
  id: ID
}

type Query {
  event(where: EventWhereUniqueInput!): Event
  events(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Event]!
  eventsConnection(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): EventConnection!
  game(where: GameWhereUniqueInput!): Game
  games(where: GameWhereInput, orderBy: GameOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Game]!
  gamesConnection(where: GameWhereInput, orderBy: GameOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): GameConnection!
  image(where: ImageWhereUniqueInput!): Image
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image]!
  imagesConnection(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ImageConnection!
  locations(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Location]!
  locationsConnection(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LocationConnection!
  person(where: PersonWhereUniqueInput!): Person
  persons(where: PersonWhereInput, orderBy: PersonOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Person]!
  personsConnection(where: PersonWhereInput, orderBy: PersonOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PersonConnection!
  structure(where: StructureWhereUniqueInput!): Structure
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure]!
  structuresConnection(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): StructureConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  node(id: ID!): Node
}

type Structure {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  type: StructureType!
  name: String!
  about: String!
  location: Location!
  people(where: PersonWhereInput, orderBy: PersonOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Person!]
  structures(where: StructureWhereInput, orderBy: StructureOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Structure!]
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image!]
  games(where: GameWhereInput, orderBy: GameOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Game!]
  events(where: EventWhereInput, orderBy: EventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Event!]
}

type StructureConnection {
  pageInfo: PageInfo!
  edges: [StructureEdge]!
  aggregate: AggregateStructure!
}

input StructureCreateInput {
  type: StructureType!
  name: String!
  about: String!
  location: LocationCreateOneWithoutStructuresInput!
  people: PersonCreateManyWithoutStructuresInput
  structures: StructureCreateManyInput
  images: ImageCreateManyInput
  games: GameCreateManyWithoutStructuresInput
  events: EventCreateManyWithoutStructuresInput
}

input StructureCreateManyInput {
  create: [StructureCreateInput!]
  connect: [StructureWhereUniqueInput!]
}

input StructureCreateManyWithoutEventsInput {
  create: [StructureCreateWithoutEventsInput!]
  connect: [StructureWhereUniqueInput!]
}

input StructureCreateManyWithoutGamesInput {
  create: [StructureCreateWithoutGamesInput!]
  connect: [StructureWhereUniqueInput!]
}

input StructureCreateManyWithoutLocationInput {
  create: [StructureCreateWithoutLocationInput!]
  connect: [StructureWhereUniqueInput!]
}

input StructureCreateManyWithoutPeopleInput {
  create: [StructureCreateWithoutPeopleInput!]
  connect: [StructureWhereUniqueInput!]
}

input StructureCreateWithoutEventsInput {
  type: StructureType!
  name: String!
  about: String!
  location: LocationCreateOneWithoutStructuresInput!
  people: PersonCreateManyWithoutStructuresInput
  structures: StructureCreateManyInput
  images: ImageCreateManyInput
  games: GameCreateManyWithoutStructuresInput
}

input StructureCreateWithoutGamesInput {
  type: StructureType!
  name: String!
  about: String!
  location: LocationCreateOneWithoutStructuresInput!
  people: PersonCreateManyWithoutStructuresInput
  structures: StructureCreateManyInput
  images: ImageCreateManyInput
  events: EventCreateManyWithoutStructuresInput
}

input StructureCreateWithoutLocationInput {
  type: StructureType!
  name: String!
  about: String!
  people: PersonCreateManyWithoutStructuresInput
  structures: StructureCreateManyInput
  images: ImageCreateManyInput
  games: GameCreateManyWithoutStructuresInput
  events: EventCreateManyWithoutStructuresInput
}

input StructureCreateWithoutPeopleInput {
  type: StructureType!
  name: String!
  about: String!
  location: LocationCreateOneWithoutStructuresInput!
  structures: StructureCreateManyInput
  images: ImageCreateManyInput
  games: GameCreateManyWithoutStructuresInput
  events: EventCreateManyWithoutStructuresInput
}

type StructureEdge {
  node: Structure!
  cursor: String!
}

enum StructureOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  type_ASC
  type_DESC
  name_ASC
  name_DESC
  about_ASC
  about_DESC
}

type StructurePreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  type: StructureType!
  name: String!
  about: String!
}

input StructureScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  type: StructureType
  type_not: StructureType
  type_in: [StructureType!]
  type_not_in: [StructureType!]
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  AND: [StructureScalarWhereInput!]
  OR: [StructureScalarWhereInput!]
  NOT: [StructureScalarWhereInput!]
}

type StructureSubscriptionPayload {
  mutation: MutationType!
  node: Structure
  updatedFields: [String!]
  previousValues: StructurePreviousValues
}

input StructureSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: StructureWhereInput
  AND: [StructureSubscriptionWhereInput!]
  OR: [StructureSubscriptionWhereInput!]
  NOT: [StructureSubscriptionWhereInput!]
}

enum StructureType {
  STUDIO
  ASSOCIATION
  ORGANISATION
}

input StructureUpdateDataInput {
  type: StructureType
  name: String
  about: String
  location: LocationUpdateOneRequiredWithoutStructuresInput
  people: PersonUpdateManyWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  games: GameUpdateManyWithoutStructuresInput
  events: EventUpdateManyWithoutStructuresInput
}

input StructureUpdateInput {
  type: StructureType
  name: String
  about: String
  location: LocationUpdateOneRequiredWithoutStructuresInput
  people: PersonUpdateManyWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  games: GameUpdateManyWithoutStructuresInput
  events: EventUpdateManyWithoutStructuresInput
}

input StructureUpdateManyDataInput {
  type: StructureType
  name: String
  about: String
}

input StructureUpdateManyInput {
  create: [StructureCreateInput!]
  update: [StructureUpdateWithWhereUniqueNestedInput!]
  upsert: [StructureUpsertWithWhereUniqueNestedInput!]
  delete: [StructureWhereUniqueInput!]
  connect: [StructureWhereUniqueInput!]
  disconnect: [StructureWhereUniqueInput!]
  deleteMany: [StructureScalarWhereInput!]
  updateMany: [StructureUpdateManyWithWhereNestedInput!]
}

input StructureUpdateManyMutationInput {
  type: StructureType
  name: String
  about: String
}

input StructureUpdateManyWithoutEventsInput {
  create: [StructureCreateWithoutEventsInput!]
  delete: [StructureWhereUniqueInput!]
  connect: [StructureWhereUniqueInput!]
  disconnect: [StructureWhereUniqueInput!]
  update: [StructureUpdateWithWhereUniqueWithoutEventsInput!]
  upsert: [StructureUpsertWithWhereUniqueWithoutEventsInput!]
  deleteMany: [StructureScalarWhereInput!]
  updateMany: [StructureUpdateManyWithWhereNestedInput!]
}

input StructureUpdateManyWithoutGamesInput {
  create: [StructureCreateWithoutGamesInput!]
  delete: [StructureWhereUniqueInput!]
  connect: [StructureWhereUniqueInput!]
  disconnect: [StructureWhereUniqueInput!]
  update: [StructureUpdateWithWhereUniqueWithoutGamesInput!]
  upsert: [StructureUpsertWithWhereUniqueWithoutGamesInput!]
  deleteMany: [StructureScalarWhereInput!]
  updateMany: [StructureUpdateManyWithWhereNestedInput!]
}

input StructureUpdateManyWithoutLocationInput {
  create: [StructureCreateWithoutLocationInput!]
  delete: [StructureWhereUniqueInput!]
  connect: [StructureWhereUniqueInput!]
  disconnect: [StructureWhereUniqueInput!]
  update: [StructureUpdateWithWhereUniqueWithoutLocationInput!]
  upsert: [StructureUpsertWithWhereUniqueWithoutLocationInput!]
  deleteMany: [StructureScalarWhereInput!]
  updateMany: [StructureUpdateManyWithWhereNestedInput!]
}

input StructureUpdateManyWithoutPeopleInput {
  create: [StructureCreateWithoutPeopleInput!]
  delete: [StructureWhereUniqueInput!]
  connect: [StructureWhereUniqueInput!]
  disconnect: [StructureWhereUniqueInput!]
  update: [StructureUpdateWithWhereUniqueWithoutPeopleInput!]
  upsert: [StructureUpsertWithWhereUniqueWithoutPeopleInput!]
  deleteMany: [StructureScalarWhereInput!]
  updateMany: [StructureUpdateManyWithWhereNestedInput!]
}

input StructureUpdateManyWithWhereNestedInput {
  where: StructureScalarWhereInput!
  data: StructureUpdateManyDataInput!
}

input StructureUpdateWithoutEventsDataInput {
  type: StructureType
  name: String
  about: String
  location: LocationUpdateOneRequiredWithoutStructuresInput
  people: PersonUpdateManyWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  games: GameUpdateManyWithoutStructuresInput
}

input StructureUpdateWithoutGamesDataInput {
  type: StructureType
  name: String
  about: String
  location: LocationUpdateOneRequiredWithoutStructuresInput
  people: PersonUpdateManyWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  events: EventUpdateManyWithoutStructuresInput
}

input StructureUpdateWithoutLocationDataInput {
  type: StructureType
  name: String
  about: String
  people: PersonUpdateManyWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  games: GameUpdateManyWithoutStructuresInput
  events: EventUpdateManyWithoutStructuresInput
}

input StructureUpdateWithoutPeopleDataInput {
  type: StructureType
  name: String
  about: String
  location: LocationUpdateOneRequiredWithoutStructuresInput
  structures: StructureUpdateManyInput
  images: ImageUpdateManyInput
  games: GameUpdateManyWithoutStructuresInput
  events: EventUpdateManyWithoutStructuresInput
}

input StructureUpdateWithWhereUniqueNestedInput {
  where: StructureWhereUniqueInput!
  data: StructureUpdateDataInput!
}

input StructureUpdateWithWhereUniqueWithoutEventsInput {
  where: StructureWhereUniqueInput!
  data: StructureUpdateWithoutEventsDataInput!
}

input StructureUpdateWithWhereUniqueWithoutGamesInput {
  where: StructureWhereUniqueInput!
  data: StructureUpdateWithoutGamesDataInput!
}

input StructureUpdateWithWhereUniqueWithoutLocationInput {
  where: StructureWhereUniqueInput!
  data: StructureUpdateWithoutLocationDataInput!
}

input StructureUpdateWithWhereUniqueWithoutPeopleInput {
  where: StructureWhereUniqueInput!
  data: StructureUpdateWithoutPeopleDataInput!
}

input StructureUpsertWithWhereUniqueNestedInput {
  where: StructureWhereUniqueInput!
  update: StructureUpdateDataInput!
  create: StructureCreateInput!
}

input StructureUpsertWithWhereUniqueWithoutEventsInput {
  where: StructureWhereUniqueInput!
  update: StructureUpdateWithoutEventsDataInput!
  create: StructureCreateWithoutEventsInput!
}

input StructureUpsertWithWhereUniqueWithoutGamesInput {
  where: StructureWhereUniqueInput!
  update: StructureUpdateWithoutGamesDataInput!
  create: StructureCreateWithoutGamesInput!
}

input StructureUpsertWithWhereUniqueWithoutLocationInput {
  where: StructureWhereUniqueInput!
  update: StructureUpdateWithoutLocationDataInput!
  create: StructureCreateWithoutLocationInput!
}

input StructureUpsertWithWhereUniqueWithoutPeopleInput {
  where: StructureWhereUniqueInput!
  update: StructureUpdateWithoutPeopleDataInput!
  create: StructureCreateWithoutPeopleInput!
}

input StructureWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  type: StructureType
  type_not: StructureType
  type_in: [StructureType!]
  type_not_in: [StructureType!]
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  about: String
  about_not: String
  about_in: [String!]
  about_not_in: [String!]
  about_lt: String
  about_lte: String
  about_gt: String
  about_gte: String
  about_contains: String
  about_not_contains: String
  about_starts_with: String
  about_not_starts_with: String
  about_ends_with: String
  about_not_ends_with: String
  location: LocationWhereInput
  people_every: PersonWhereInput
  people_some: PersonWhereInput
  people_none: PersonWhereInput
  structures_every: StructureWhereInput
  structures_some: StructureWhereInput
  structures_none: StructureWhereInput
  images_every: ImageWhereInput
  images_some: ImageWhereInput
  images_none: ImageWhereInput
  games_every: GameWhereInput
  games_some: GameWhereInput
  games_none: GameWhereInput
  events_every: EventWhereInput
  events_some: EventWhereInput
  events_none: EventWhereInput
  AND: [StructureWhereInput!]
  OR: [StructureWhereInput!]
  NOT: [StructureWhereInput!]
}

input StructureWhereUniqueInput {
  id: ID
}

type Subscription {
  event(where: EventSubscriptionWhereInput): EventSubscriptionPayload
  game(where: GameSubscriptionWhereInput): GameSubscriptionPayload
  image(where: ImageSubscriptionWhereInput): ImageSubscriptionPayload
  location(where: LocationSubscriptionWhereInput): LocationSubscriptionPayload
  person(where: PersonSubscriptionWhereInput): PersonSubscriptionPayload
  structure(where: StructureSubscriptionWhereInput): StructureSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  email: String!
  avatar(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image!]
  person: Person
}

type UserConnection {
  pageInfo: PageInfo!
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreateInput {
  email: String!
  avatar: ImageCreateManyInput
  person: PersonCreateOneWithoutUserInput
}

input UserCreateOneWithoutPersonInput {
  create: UserCreateWithoutPersonInput
  connect: UserWhereUniqueInput
}

input UserCreateWithoutPersonInput {
  email: String!
  avatar: ImageCreateManyInput
}

type UserEdge {
  node: User!
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  email_ASC
  email_DESC
}

type UserPreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  email: String!
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserWhereInput
  AND: [UserSubscriptionWhereInput!]
  OR: [UserSubscriptionWhereInput!]
  NOT: [UserSubscriptionWhereInput!]
}

input UserUpdateInput {
  email: String
  avatar: ImageUpdateManyInput
  person: PersonUpdateOneWithoutUserInput
}

input UserUpdateManyMutationInput {
  email: String
}

input UserUpdateOneWithoutPersonInput {
  create: UserCreateWithoutPersonInput
  update: UserUpdateWithoutPersonDataInput
  upsert: UserUpsertWithoutPersonInput
  delete: Boolean
  disconnect: Boolean
  connect: UserWhereUniqueInput
}

input UserUpdateWithoutPersonDataInput {
  email: String
  avatar: ImageUpdateManyInput
}

input UserUpsertWithoutPersonInput {
  update: UserUpdateWithoutPersonDataInput!
  create: UserCreateWithoutPersonInput!
}

input UserWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  avatar_every: ImageWhereInput
  avatar_some: ImageWhereInput
  avatar_none: ImageWhereInput
  person: PersonWhereInput
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
  email: String
}
`
      }
    