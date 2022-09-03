import getImageLinks from '../utils/imageLinks.server';

/**
 * @typedef {import('@prisma/client').person} ExtendedPerson
 *
 * @param {import("@prisma/client").person} person
 * @returns {ExtendedPerson} The extended person
 */
export default async function computePerson(person) {
  let github_username;

  if (person.github_id) {
    const response = await fetch(
      'https://api.github.com/users/' + person.github_id
    );

    const data = await response.json();

    github_username = data.login;
  }

  return {
    ...person,
    github_username,
    avatar: person.avatar ? getImageLinks(person.avatar) : undefined,
  };
}
