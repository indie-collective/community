/**
 * How each organisation type (the `entity_type` enum) is labelled and
 * coloured, everywhere: cards, the org page, the form and map markers.
 */
export const ORG_TYPES = {
  studio: { label: 'Studio', shortLabel: 'Studio', color: 'yellow' },
  association: { label: 'Association', shortLabel: 'Assoc.', color: 'green' },
};

/** The type's label; `short` for tight spots like card thumbnails. */
export const orgTypeLabel = (type, { short = false } = {}) =>
  ORG_TYPES[type]?.[short ? 'shortLabel' : 'label'] ?? type;

/** The type's Chakra colour palette. */
export const orgTypeColor = (type) => ORG_TYPES[type]?.color ?? 'gray';
