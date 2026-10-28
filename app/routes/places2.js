import { redirect } from 'react-router';

// An old debug page of place counts (#348): /places shows them.
export const loader = () => redirect('/places', 301);
