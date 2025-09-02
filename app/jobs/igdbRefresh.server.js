import cron from 'node-cron';
import { db } from '../utils/db.server';
import { popIgdbJob } from '../utils/pgmq.server';
import { fetchIGDBGame } from '../utils/igdb.server';

export async function processIgdbQueue() {
  const job = await popIgdbJob();
  if (!job) return false;
  try {
    const payload = job.message || job.msg || {};
    const { gameId, slug } = payload;
    if (!gameId || !slug) return false;
    const data = await fetchIGDBGame(slug);
    if (data) {
      await db.game.update({
        where: { id: gameId },
        data: {
          igdb_data: data,
          igdb_data_fetched_at: new Date(),
        },
      });
    }
    return true;
  } catch (err) {
    console.log('IGDB queue worker error', err);
    return false;
  }
}

async function drainIgdbQueue() {
  while (await processIgdbQueue()) {
    // keep draining until queue is empty
  }
}

if (!global.__igdbQueueInterval) {
  global.__igdbQueueInterval = cron.schedule('* * * * *', drainIgdbQueue);
}
