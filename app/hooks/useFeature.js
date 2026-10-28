import { useRouteLoaderData } from 'react-router';

/**
 * Whether a feature flag (utils/featureFlags) is on for whoever is looking,
 * from the root loader. Off where the root loader has no data (error pages).
 */
export default function useFeature(key) {
  return Boolean(useRouteLoaderData('root')?.features?.[key]);
}
