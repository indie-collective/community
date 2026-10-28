import { redirect } from 'react-router';

import { latestRewindYear } from '../utils/rewind';

// The latest year in review (#348).
export const loader = () => redirect(`/rewind/${latestRewindYear()}`);
