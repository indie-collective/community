import { Text } from '@chakra-ui/react';
import { json, redirect, Response } from '@remix-run/node';

import { db } from '../../utils/db.server';

export async function loader({ params }) {
  const { id } = params;

  const change = await db.change.findFirst({
    where: {
      record_id: id,
      table_name: 'event',
    },
    orderBy: {
      created_at: 'desc',
    },
    select: {
      id: true,
    },
  });

  if (change) {
    return redirect(`/event/${id}/changes/${change.id}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  return json({});
}

export function ErrorBoundary() {
  return <Text>Something went wrong.</Text>;
}

export default function ChangesIndexPage() {
  return <Text>No history for now.</Text>;
}
