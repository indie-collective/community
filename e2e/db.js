// The local D1 the server runs on, for specs that set up or check records
// directly (D1_PERSIST_PATH comes from playwright.config.js).
export { db } from '../app/db/node.js';
export * from '../app/db/schema.js';
export { searchText } from '../app/db/searchText.js';

// The server and the specs open the same local D1 from two workerd
// processes, so a spec's query can meet the server's write lock
// (SQLITE_BUSY) while the server works after a response. Retries those.
export async function retryBusy(query) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await query();
    } catch (error) {
      const message = [error, error?.cause, error?.cause?.cause]
        .map((e) => e?.message ?? '')
        .join(' ');
      const busy = /SQLITE_BUSY|database is locked|session commit token/.test(message);
      if (!busy || attempt === 10) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
    }
  }
}
