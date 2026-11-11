import { config } from '../../theme';

/**
 * The site's own tokens, as the Theme pages show them: read from the
 * theme's config, where each says what it is for in its `description`
 * (Chakra keeps the values but drops the descriptions).
 */
export { config };
export const semanticTokens = config.theme.semanticTokens;
export const tokens = config.theme.tokens;

/**
 * A token group as a flat list, `primary.solid` for nested ones:
 * `[{ name, description, value }]`, where value is the token's own,
 * a string or `{ base, _dark }`.
 */
export const flatten = (group, prefix = '') =>
  Object.entries(group).flatMap(([key, token]) =>
    'value' in token
      ? [
          {
            name: prefix + key,
            description: token.description,
            value: token.value,
          },
        ]
      : flatten(token, `${prefix}${key}.`)
  );

/** A token row's two samples (`data-sample`), in the light and dark panels. */
export const panels = (canvasElement, name) => {
  const row = canvasElement.querySelector(`[data-token="${name}"]`);
  return {
    light: row.querySelector('[data-mode=light] [data-sample]'),
    dark: row.querySelector('[data-mode=dark] [data-sample]'),
  };
};
