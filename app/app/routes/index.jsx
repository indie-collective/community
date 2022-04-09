import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Container, Heading } from '@chakra-ui/react';

import { db } from '../utils/db.server';

export const loader = async () => {
  const data = {
    games: await db.game.findMany(),
  };
  return json(data);
};

export default function Index() {
  const data = useLoaderData();

  return (
    <Container>
      <Heading>Community</Heading>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Container>
  );
}
