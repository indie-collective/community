import getImageLinks from '../utils/imageLinks.server';
import computeGame from './game';
import computeOrg from './org';

async function computeEntityEvent(entityEvent) {
  const { entity } = entityEvent;

  return {
    ...entityEvent,
    entity: entity ? await computeOrg(entity) : undefined,
  };
}

async function computeGameEvent(gameEvent) {
  return {
    ...gameEvent,
    game: gameEvent.game ? await computeGame(gameEvent.game) : undefined,
  };
}

/**
 * @typedef {import('@prisma/client').event} ExtendedEvent
 *
 * @param {import("@prisma/client").event} event
 * @returns {ExtendedEvent} The extended event
 */
export default async function computeEvent(event) {
  return {
    ...event,
    cover: event.cover ? getImageLinks(event.cover) : null,
    entity_event: event.entity_event ? await Promise.all(event.entity_event?.map(computeEntityEvent)) : undefined,
    game_event: event.game_event ? await Promise.all(event.game_event?.map(computeGameEvent)) : undefined,
  };
}
