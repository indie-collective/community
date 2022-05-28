import { PrismaClient } from '@prisma/client';

/** @type {PrismaClient} */ 
let db;

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  db = global.__db;
}

// @type PrismaClient
export { db };
