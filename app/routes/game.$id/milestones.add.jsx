import { redirect } from 'react-router';

import { addGameMilestone } from '../../data/games.server';
import { GAME_MILESTONE_KINDS } from '../../db/schema.js';
import { authorizer, canWrite } from '../../utils/auth.server';
import { MAX_NOTE_LENGTH, milestoneDate } from '../../utils/gameTimeline';
import { routeRecordId } from '../../utils/pageRecord.server';

// Adds a step to the game's timeline (#332).
export async function action(args) {
  const { params, request } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();
  const kind = data.get('kind');
  const when = milestoneDate(data.get('year'), data.get('month'), data.get('day'));
  const note = String(data.get('note') ?? '').trim();
  if (!GAME_MILESTONE_KINDS.includes(kind) || !when || note.length > MAX_NOTE_LENGTH) {
    throw new Response('Bad Request', { status: 400 });
  }

  await addGameMilestone(id, {
    kind,
    date: when.date,
    precision: when.precision,
    note,
    authorId: currentUser.id,
  });

  return redirect(`/game/${id}`);
}
