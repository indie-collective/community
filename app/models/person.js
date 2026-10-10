import getImageLinks from '../utils/imageLinks.server';

/**
 * @typedef {object} ExtendedPerson
 *
 * @param {object} person - in the shape data/shapes.server returns
 * @returns {ExtendedPerson} The extended person
 */
export default async function computePerson(person) {
  return {
    ...person,
    avatar: person.avatar ? getImageLinks(person.avatar) : undefined,
    discord_url: person.discord_id
      ? `https://discord.com/users/${person.discord_id}`
      : null,
  };
}
