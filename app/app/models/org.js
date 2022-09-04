import getImageLinks from '../utils/imageLinks.server';
import computeEvent from './event';
import computeGame from './game';

async function computeGameEntity(gameEntity) {
  return {
    ...gameEntity,
    game: gameEntity.game ? await computeGame(gameEntity.game) : undefined,
  };
}

async function computeOrgEvent(orgEvent) {
  return {
    ...orgEvent,
    event: orgEvent.event ? await computeEvent(orgEvent.event) : undefined,
  };
}

/**
 * @typedef {import('@prisma/client').entity} ExtendedOrg
 *
 * @param {import("@prisma/client").entity} org
 * @returns {ExtendedOrg} The extended organization
 */
export default async function computeOrg(org) {
  return {
    ...org,
    logo: org.logo ? getImageLinks(org.logo) : null,
    entity_event: org.entity_event ? await Promise.all(org.entity_event?.map(computeOrgEvent)) : undefined,
    game_entity: org.game_entity ? await Promise.all(org.game_entity?.map(computeGameEntity)) : undefined,
  };
}
