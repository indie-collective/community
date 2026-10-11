/**
 * How an organisation took part in a game (#40), as labelled everywhere.
 * The values are the database's (`game_organizations.role`).
 */
export const GAME_ROLES = [
  ['developer', 'Developer'],
  ['co_developer', 'Co-developer'],
  ['publisher', 'Publisher'],
  ['porting', 'Porting'],
  ['support', 'Support'],
];

/** The role's label. */
export const gameRoleLabel = (role) =>
  GAME_ROLES.find(([value]) => value === role)?.[1] ?? 'Developer';
