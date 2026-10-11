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

/**
 * Whether an organisation is still going (#39), labelled everywhere: the
 * `organizations.status` values. Only those not active get a badge.
 */
export const ORG_STATUSES = {
  active: { label: 'Active', color: 'green' },
  hiatus: { label: 'On hiatus', color: 'orange' },
  closed: { label: 'Closed', color: 'gray' },
};

/** The status's label. */
export const orgStatusLabel = (status) => ORG_STATUSES[status]?.label ?? status;
