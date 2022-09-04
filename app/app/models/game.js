import { getIGDBGame } from '../utils/igdb.server';
import getImageLinks from '../utils/imageLinks.server';
import computeOrg from './org';

async function computeGameEntity(gameEntity) {
  const {entity} = gameEntity;

  return {
    ...gameEntity,
    entity: entity ? await computeOrg(entity) : undefined,
  };
}

function computeGameImage(gameImage) {
  return {
    ...gameImage,
    image: gameImage.image ? getImageLinks(gameImage.image) : undefined,
  };
}

/**
 * @typedef {import('@prisma/client').game} ExtendedGame
 * @property {object} igdb_game - The game data from IGDB
 *
 * @param {import("@prisma/client").game} game
 * @returns {ExtendedGame} The extended game
 */
export default async function computeGame(game) {
  if (!game) {
    throw new Error('Tried to compute game but received undefined');
  }

  const game_entity = game.game_entity ? await Promise.all(game.game_entity.map(computeGameEntity) || []) : undefined;

  let igdb_game;
  if (game.igdb_slug) {
    igdb_game = await getIGDBGame(game.igdb_slug);

    if (game_entity) {
      // filter out companies that we have already
      igdb_game.involved_companies = igdb_game.involved_companies.filter(
        ({ company }) =>
          // when we have igdb_slug on entity
          // game_entity.some(({ entity }) => entity.igdb_slug === company.slug)

          // so we do this in the meantime
          !game_entity.some(
            ({ entity }) =>
              entity.name.toLowerCase() === company.name.toLowerCase()
          )
      );
    }
  }

  const game_image = game.game_image?.map(computeGameImage)

  return {
    ...game,
    igdb_game,
    game_image,
    images: game_image?.map((gi) => gi.image),
    game_entity,
  };
}
