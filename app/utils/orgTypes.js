/**
 * How each organisation type (the `entity_type` enum) is labelled and
 * coloured, everywhere: cards, the org page, the form and map markers. The
 * colours are the atlas's marks: studios green, associations lilac.
 */
export const ORG_TYPES = {
  studio: { label: 'Studio', shortLabel: 'Studio', color: 'brand' },
  association: { label: 'Association', shortLabel: 'Assoc.', color: 'lilac' },
};

/** The type's label; `short` for tight spots like card thumbnails. */
export const orgTypeLabel = (type, { short = false } = {}) =>
  ORG_TYPES[type]?.[short ? 'shortLabel' : 'label'] ?? type;

/** The type's colour token, as on the atlas. */
export const orgTypeColor = (type) => ORG_TYPES[type]?.color ?? 'muted';

/**
 * A map pin's colour token: the atlas's colour for its kind (#321), coral
 * for events (#211).
 */
export const pinColor = (type) => (type === 'event' ? 'coral' : orgTypeColor(type));

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
