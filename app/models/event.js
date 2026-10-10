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

// Participants' avatars arrive as raw image rows; the page needs their
// thumbnail URL, or every attendee falls back to their initial.
function computeEventParticipant(eventParticipant) {
  const { person } = eventParticipant;

  return {
    ...eventParticipant,
    person: person && {
      ...person,
      avatar: person.avatar ? getImageLinks(person.avatar) : null,
    },
  };
}

async function computeGameEvent(gameEvent) {
  return {
    ...gameEvent,
    game: gameEvent.game ? await computeGame(gameEvent.game) : undefined,
  };
}

/**
 * @typedef {object} ExtendedEvent
 *
 * @param {object} event - in the shape data/shapes.server returns
 * @returns {ExtendedEvent} The extended event
 */
export default async function computeEvent(event) {
  return {
    ...event,
    cover: event.cover ? getImageLinks(event.cover) : null,
    entity_event: event.entity_event ? await Promise.all(event.entity_event?.map(computeEntityEvent)) : undefined,
    game_event: event.game_event ? await Promise.all(event.game_event?.map(computeGameEvent)) : undefined,
    event_participant: event.event_participant?.map(computeEventParticipant),
  };
}
