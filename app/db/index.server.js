// The database (#151, ADR 0003): D1 through Drizzle, from the Worker's DB
// binding. Node scripts and tests use app/db/node.js instead.
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from './schema.js';

export const db = drizzle(env.DB, { schema });
