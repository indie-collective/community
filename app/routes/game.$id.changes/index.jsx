import { Text } from '@chakra-ui/react';
import { redirect } from 'react-router';

import { getLatestChangeId } from '../../data/changes.server';

export async function loader({ params }) {
  const { id } = params;

  const changeId = await getLatestChangeId('game', id);

  if (changeId) {
    return redirect(`/game/${params.id}/changes/${changeId}`, {
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
