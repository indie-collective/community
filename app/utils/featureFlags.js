// Feature flags: parts of the site that can be hidden while they're not
// ready, from /admin/flags. Pure, for the client too: the stored states are
// read in data/featureFlags.server.

// Each flag is off (nobody sees it), admins (only admins, to try it out) or
// on (everyone).
export const FLAG_STATES = [
  ['off', 'Off'],
  ['admins', 'Admins only'],
  ['on', 'Everyone'],
];

export const FEATURE_FLAGS = [
  {
    key: 'opportunities',
    label: 'Opportunities',
    description:
      'The opportunities list, posting from studios’, games’ and events’ pages, and the “Open to pitches” filter on publishers (#345).',
    default: 'off',
  },
  {
    key: 'breton',
    label: 'Breton',
    description:
      'The interface in Breton, a draft until a Breton speaker reviews it (#373): offered in the language menu, and chosen from a browser’s languages.',
    default: 'admins',
  },
  {
    key: 'api',
    label: 'API and widgets',
    description:
      'The public read-only API (/api, /api/v1), its documentation and the widgets other sites embed (/embed), with their links in the footer and on organisations’ pages (#349).',
    default: 'admins',
  },
];

const isState = (state) => FLAG_STATES.some(([value]) => value === state);

/** A flag's state from what's stored (`null` when nothing is): its default otherwise. */
export function flagState(key, stored) {
  const flag = FEATURE_FLAGS.find((f) => f.key === key);
  if (!flag) return 'off';
  return isState(stored) ? stored : flag.default;
}

/** Whether a flag in `state` is on for `currentUser` (null when signed out). */
export const isOnFor = (state, currentUser) => state === 'on' || (state === 'admins' && Boolean(currentUser?.isAdmin));

/** Whether `state` is one a flag can be set to. */
export const isFlagState = isState;
