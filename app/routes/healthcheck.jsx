import { checkDatabase } from '../data/site.server';

// OK when the database answers a query.
export const loader = async () => {
  try {
    await checkDatabase();
    return new Response('OK');
  } catch (error) {
    console.log('healthcheck ❌', { error });
    return new Response('ERROR', { status: 500 });
  }
};
