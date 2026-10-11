import { Text } from '@chakra-ui/react';
import { redirect } from 'react-router';

import { getLatestChangeId } from '../../data/changes.server';
import { routeRecordId } from '../../utils/pageRecord.server';

export async function loader({ params }) {
  const id = await routeRecordId('event', params.id);

  const changeId = await getLatestChangeId('event', id);

  if (changeId) {
    return redirect(`/event/${id}/changes/${changeId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  return {};
}

export function ErrorBoundary() {
  return <Text>Something went wrong.</Text>;
}

export default function ChangesIndexPage() {
  return <Text>No history for now.</Text>;
}
