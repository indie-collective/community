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
import computeEvent from '../../models/event';

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

  const revision = await db.change.findUnique({
    where: {
      id: revisionId,
    },
    select: {
      operation: true,
      id: true,
      data: true,
      record_id: true,
      created_at: true,
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

  const event = await db.event.findUnique({
    where: {
      id: revision.record_id,
    },
  });

  if (!event)
     throw new Response('Event Not Found', {
       status: 404, 
     });

  const previous = await db.change.findFirst({
    where: {
      record_id: revision.record_id,
      table_name: 'event',
      created_at: {
        lt: revision.created_at,
      },
    },
    select: {
      id: true,
      data: true,
      created_at: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  const diff = require('diff');

  const revisionData = revision.data || {};
  const previousData = previous?.data || {};

  const data = {
    event: await computeEvent(event),
    diff: {
      name: diff.diffWords(
        previousData.name || '',
        revision.operation === 'delete' ? '' : revisionData.name || ''
      ),
      about: diff.diffWords(
         previousData.about || '',
        revision.operation === 'delete' ? '' : revisionData.about || ''
      ),
      site: diff.diffWords(
         previousData.site || '',
        revision.operation === 'delete' ? '' : revisionData.site || ''
      ),
    },
    createdAt: revision.created_at,
    author: revision.author,
    currentUser,
  };

  return json(data);
};

export const meta = ({ data, location }) => {
  if (!data?.event)
    return {
      title: 'Event Not Found',
    };

  const { event } = data;

  return {
    title: `Version history - ${event.name}`,
    'og:title': `Version history - ${event.name}`,
    'og:description': `Version history of ${event.name}.`,
    'og:url': `${location.protocol}://${location.host}/event/${event.id}`,
    'twitter:site': '@IndieColle',
    'twitter:title': `Version history - ${event.name}`,
    'twitter:description': `Version history of ${event.name}.`,
  };
};

const EventRevision = () => {
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
            Restore and Restrict {author?.username}
          </Button>
        )}
      </Flex>

      <TableContainer>
        <Table variant="simple">
          <TableCaption>
            Changes made by {author?.username || 'Unknown'} on{' '}
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
                <Tr key={key}>
                  <Th>{key}</Th>
                  <Td whiteSpace="normal">
                    {changes
                      .filter((l) => !l.added)
                      .map(({ removed, value }, i) => (
                        <Text
                          key={i}
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
                      .map(({ added, value }, i) => (
                        <Text
                          key={i}
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

export default EventRevision;
