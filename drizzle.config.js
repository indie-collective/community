// Drizzle Kit: generates the D1 migrations from app/db/schema.js (#151).
//   npx drizzle-kit generate --name <what-changed>
// Wrangler applies them: npm run db:migrate (local) or with --remote.
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './app/db/schema.js',
  out: './drizzle/migrations',
});
