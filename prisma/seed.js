
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const { faker } = await import('@faker-js/faker');
  console.log('Seeding the database...');

  // disable triggers
  await prisma.$executeRaw`ALTER TABLE "person" DISABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "game" DISABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "event" DISABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "entity" DISABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "location" DISABLE TRIGGER ALL;`;

  // Create people
  const people = [];
  for (let i = 0; i < 10; i++) {
    const person = await prisma.person.create({
      data: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        username: faker.internet.username(),
        about: faker.lorem.paragraph(),
      },
    });
    people.push(person);
  }

  // Create games
  const games = [];
  for (let i = 0; i < 10; i++) {
    const game = await prisma.game.create({
      data: {
        name: faker.commerce.productName(),
        about: faker.lorem.paragraph(),
        site: faker.internet.url(),
      },
    });
    games.push(game);
  }

  // Create events
  const events = [];
  for (let i = 0; i < 10; i++) {
    const event = await prisma.event.create({
      data: {
        name: faker.company.name(),
        about: faker.lorem.paragraph(),
        site: faker.internet.url(),
        starts_at: faker.date.future(),
        ends_at: faker.date.future(),
      },
    });
    events.push(event);
  }

  // Create entities
  const entities = [];
  for (let i = 0; i < 10; i++) {
    const entity = await prisma.entity.create({
      data: {
        name: faker.company.name(),
        about: faker.lorem.paragraph(),
        site: faker.internet.url(),
        type: faker.helpers.arrayElement(['studio', 'association']),
      },
    });
    entities.push(entity);
  }

  // Create locations
  const locations = [];
  for (let i = 0; i < 10; i++) {
    const location = await prisma.location.create({
      data: {
        city: faker.location.city(),
        latitude: faker.location.latitude(),
        longitude: faker.location.longitude(),
        street: faker.location.streetAddress(),
        country_code: faker.location.countryCode(),
        region: faker.location.state(),
      },
    });
    locations.push(location);
  }

  // Connect games to people (authors)
  for (const game of games) {
    const randomPerson = faker.helpers.arrayElement(people);
    await prisma.game_author.create({
      data: {
        game_id: game.id,
        person_id: randomPerson.id,
      },
    });
  }

  // Connect events to people (participants)
  for (const event of events) {
    const randomPerson = faker.helpers.arrayElement(people);
    await prisma.event_participant.create({
      data: {
        event_id: event.id,
        person_id: randomPerson.id,
      },
    });
  }

  // Connect entities to people (members)
  for (const entity of entities) {
    const randomPerson = faker.helpers.arrayElement(people);
    await prisma.entity_member.create({
      data: {
        entity_id: entity.id,
        person_id: randomPerson.id,
      },
    });
  }

  // Connect games to entities
  for (const game of games) {
    const randomEntity = faker.helpers.arrayElement(entities);
    await prisma.game_entity.create({
      data: {
        game_id: game.id,
        entity_id: randomEntity.id,
      },
    });
  }

  // Connect events to entities
  for (const event of events) {
    const randomEntity = faker.helpers.arrayElement(entities);
    await prisma.entity_event.create({
      data: {
        event_id: event.id,
        entity_id: randomEntity.id,
      },
    });
  }

  // Connect events to locations
  for (const event of events) {
    const randomLocation = faker.helpers.arrayElement(locations);
    await prisma.event.update({
      where: { id: event.id },
      data: { location_id: randomLocation.id },
    });
  }

  // Connect entities to locations
  for (const entity of entities) {
    const randomLocation = faker.helpers.arrayElement(locations);
    await prisma.entity.update({
      where: { id: entity.id },
      data: { location_id: randomLocation.id },
    });
  }

  // enable triggers
  await prisma.$executeRaw`ALTER TABLE "person" ENABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "game" ENABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "event" ENABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "entity" ENABLE TRIGGER ALL;`;
  await prisma.$executeRaw`ALTER TABLE "location" ENABLE TRIGGER ALL;`;

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
