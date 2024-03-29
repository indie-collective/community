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

db.$use(async (params, next) => {
  if (params.model == 'game') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Change to findFirst - you cannot filter
      // by anything except ID / unique with findUnique
      params.action = 'findFirst';
      // Add 'deleted' filter
      // ID filter maintained
      params.args.where['deleted'] = false;
    }
    if (params.action === 'findMany') {
      // Find many queries
      if (params.args.where) {
        if (params.args.where.deleted == undefined) {
          // Exclude deleted records if they have not been explicitly requested
          params.args.where['deleted'] = false;
        }
      } else {
        params.args['where'] = { deleted: false };
      }
    }
  }
  return next(params);
});

db.$use(async (params, next) => {
  if (params.model == 'game') {
    // Not very useful, it breaks a lot of the update API
    // if (params.action == 'update') {
    //   // Change to updateMany - you cannot filter
    //   // by anything except ID / unique with findUnique
    //   params.action = 'updateMany';
    //   // Add 'deleted' filter
    //   // ID filter maintained
    //   params.args.where['deleted'] = false;
    // }
    if (params.action == 'updateMany') {
      if (params.args.where != undefined) {
        params.args.where['deleted'] = false;
      } else {
        params.args['where'] = { deleted: false };
      }
    }
  }
  return next(params);
});

db.$use(async (params, next) => {
  // Check incoming query type
  if (params.model == 'game') {
    if (params.action == 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = { deleted: true };
    }
    if (params.action == 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deleted'] = true;
      } else {
        params.args['data'] = { deleted: true };
      }
    }
  }
  return next(params);
});

// @type PrismaClient
export { db };
