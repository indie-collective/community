import {
  Box,
  Heading,
  Text,
  Button,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Flex,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';

import { db } from '../../utils/db.server';
import { authenticator } from '../../utils/auth.server';
import computeGame from '../../models/game';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const { id, revisionId } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const revision = await db.game_change.findUnique({
    where: {
      id: revisionId,
    },
    select: {
      operation: true,
      id: true,
      name: true,
      about: true,
      site: true,
      created_at: true,
      game: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!revision)
    throw new Response('Not Found', {
      status: 404,
    });

  const previous = await db.game_change.findFirst({
    where: {
      game_id: revision.game.id,
      created_at: {
        lt: revision.created_at,
      },
    },
    select: {
      id: true,
      name: true,
      about: true,
      site: true,
      created_at: true,
      game: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const diff = require('diff');

  const data = {
    game: await computeGame(revision.game),
    diff: {
      name: diff.diffWords(
        previous?.name || '',
        revision.operation === 'delete' ? '' : revision.name || ''
      ),
      about: diff.diffWords(
        previous?.about || '',
        revision.operation === 'delete' ? '' : revision.about || ''
      ),
      site: diff.diffWords(
        previous?.site || '',
        revision.operation === 'delete' ? '' : revision.site || ''
      ),
    },
    createdAt: revision.created_at,
    author: revision.author,
    currentUser,
  };

  return json(data);
};

export const meta = ({ data, location }) => {
  if (!data?.game)
    return {
      title: 'Game Not Found',
    };

  const { game } = data;

  return {
    title: `Version history - ${game.name}`,
    'og:title': `Version history - ${game.name}`,
    'og:description': `Version history of ${game.name}.`,
    'og:url': `${location.protocol}://${location.host}/game/${game.id}`,
    'twitter:site': '@IndieColle',
    'twitter:title': `Version history - ${game.name}`,
    'twitter:description': `Version history of ${game.name}.`,
  };
};

const Game = () => {
  const { diff, author, currentUser, createdAt } = useLoaderData();

  return (
    <Box pl={5}>
      <Flex>
        <Heading as="h3" size="md">
          Changes
        </Heading>

        <Button ml="auto">Restore</Button>
        {currentUser.isAdmin && (
          <Button ml={2} colorScheme="red">
            Restore and Restrict {author.username}
          </Button>
        )}
      </Flex>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>
            Changes made by {author.username} on{' '}
            <Text as="time">
              {new Date(createdAt).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Property</Th>
              <Th>Before</Th>
              <Th>After</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(diff)
              // keep only changes
              .filter(
                ([, changes]) =>
                  changes.length > 0 &&
                  changes.reduce((acc, c) => acc + c.count, 0) > 0
              )
              .map(([key, changes]) => (
                <Tr>
                  <Th>{key}</Th>
                  <Td whiteSpace="normal">
                    {changes
                      .filter((l) => !l.added)
                      .map(({ removed, value }) => (
                        <Text
                          as="span"
                          bgColor={removed ? 'red.500' : undefined}
                        >
                          {value}
                        </Text>
                      ))}
                  </Td>
                  <Td whiteSpace="normal">
                    {changes
                      .filter((l) => !l.removed)
                      .map(({ added, value }) => (
                        <Text
                          as="span"
                          bgColor={added ? 'green.500' : undefined}
                        >
                          {value}
                        </Text>
                      ))}
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <Text>Revision not found.</Text>;
  }

  return <Text>Something went wrong.</Text>;
}

export default Game;
