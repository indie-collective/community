/**
 * Usernames for new people, generated in the app (#150). This replaces the
 * set_default_username() trigger and the slugify() SQL function (which needed
 * the unaccent extension), with the same rules: a given username is kept if
 * it's free; otherwise the slugified first and last name, cut to 26
 * characters, plus four random digits.
 */
const MAX_LENGTH = 30;
const ATTEMPTS = 10;

/** Lower case, no accents or quotes, other symbols as hyphens, trimmed. */
export function slugifyName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['"]+/g, '')
    .replace(/[^a-z0-9\-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generated({ first_name, last_name }) {
  const base = (slugifyName(first_name) + slugifyName(last_name)).slice(0, MAX_LENGTH - 4);
  return base + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

const usernameTaken = (error) =>
  error?.code === 'P2002' && [].concat(error.meta?.target ?? []).some((field) => String(field).includes('username'));

/**
 * Creates a person, choosing a free username. Retries with a new one if
 * another sign-up takes it in the meantime; other errors are rethrown.
 */
export async function createPerson(db, data) {
  let username = data.username?.slice(0, MAX_LENGTH);
  if (!username || (await db.person.findUnique({ where: { username } }))) username = generated(data);

  for (let attempt = 1; ; attempt += 1) {
    try {
      return await db.person.create({ data: { ...data, username } });
    } catch (error) {
      if (!usernameTaken(error) || attempt >= ATTEMPTS) throw error;
      username = generated(data);
    }
  }
}
