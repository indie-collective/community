import tzLookup from '@photostructure/tz-lookup';

import { DEFAULT_TIME_ZONE } from './eventTime.js';

/**
 * The IANA time zone at a location (#204), from an offline dataset, so saving
 * an event never waits on a network call. Without coordinates, the default.
 */
export function timeZoneAt(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return DEFAULT_TIME_ZONE;
  try {
    return tzLookup(latitude, longitude);
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}
