import { db } from './db.server';

const QUEUE_NAME = 'igdb_fetch';

async function ensureQueue() {
  try {
    await db.$queryRaw`SELECT pgmq.create(${QUEUE_NAME});`;
  } catch (err) {
    // queue might already exist
  }
}

export async function enqueueIgdbJob(gameId, slug) {
  console.log(`Attempting to enqueue IGDB refresh job for gameId: ${gameId}, slug: ${slug}`);
  const game = await db.game.findUnique({
    where: { id: gameId },
    select: { igdb_data_fetched_at: true, igdb_refresh_enqueued_at: true },
  });

  if (!game) {
    console.log(`Game not found for gameId: ${gameId}. Skipping enqueue.`);
    return;
  }

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  if (game.igdb_data_fetched_at && game.igdb_data_fetched_at > fortyEightHoursAgo) {
    console.log(`Game ${gameId} was refreshed recently. Last refresh: ${game.igdb_data_fetched_at}. Skipping enqueue.`);
    return;
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (game.igdb_refresh_enqueued_at && game.igdb_refresh_enqueued_at > oneHourAgo) {
    console.log(`IGDB refresh job for game ${gameId} was enqueued recently. Last enqueue: ${game.igdb_refresh_enqueued_at}. Skipping enqueue.`);
    return;
  }

  await db.game.update({
    where: { id: gameId },
    data: { igdb_refresh_enqueued_at: new Date() },
  });

  await ensureQueue();
  const msg = JSON.stringify({ gameId, slug });
  await db.$queryRaw`SELECT pgmq.send(
    queue_name => ${QUEUE_NAME},
    msg => ${msg}::jsonb
  );`;
  console.log(`Successfully enqueued IGDB refresh job for gameId: ${gameId}`);
}

export async function popIgdbJob() {
  await ensureQueue();
  const result = await db.$queryRaw`SELECT * FROM pgmq.pop(${QUEUE_NAME});`;
  return result[0];
}
