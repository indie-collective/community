import {
  Box,
  Stack,
  Heading,
  Text,
  Button,
  Link as ChakraLink,
  List,
  Flex,
  LinkBox,
  LinkOverlay,
  Badge,
  Spacer,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import {
  Link,
  NavLink,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useMatches,
  useParams,
  useRouteError,
} from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeEvent from '../models/event';
import { formatDistanceToNow } from 'date-fns';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const event = await db.event.findUnique({
    where: {
      id,
    },
  });

  if (!event)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    event: await computeEvent(event),
    changes: await db.change.findMany({
      where: {
        record_id: event.id,
        table_name: 'event',
      },
      select: {
        id: true,
        operation: true,
        author: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    }),
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

const operationsColors = {
  create: 'green',
  update: 'blue',
  delete: 'red',
};

const EventChangeLayout = () => {
  const { event, changes } = useLoaderData();
  const { revisionId } = useParams();

  const bg = useColorModeValue('gray.100', 'gray.700');

  const { id, name } = event;

  return (
    <>
      <Box mb={5} pl={5} pr={5} mt={5}>
        <ChakraLink as={Link} to={`/event/${id}`}>
          <ArrowBackIcon />
          Back to event page
        </ChakraLink>
        <Flex direction="row" align="baseline" mt={5}>
          <Heading as="h2" size="2xl">
            {name}
          </Heading>

          <Button
            as={Link}
            to={`/event/${id}/edit`}
            leftIcon={<EditIcon />}
            ml="auto"
          >
            Edit event
          </Button>
        </Flex>
      </Box>

      <Box mb={5} pl={5} pr={5} mt={5}>
        {changes.length > 0 ? (
          <Flex direction="row" gap={10}>
            <Box>
              <Heading as="h3" size="md" mb={2}>
                Changelog
              </Heading>

              <Stack as={List} w="250px">
                {changes.map(({ id, operation, author, created_at }) => (
                  <LinkBox
                    key={id}
                    transition="background-color 200ms ease-out"
                    cursor="pointer"
                    _hover={{
                      backgroundColor: bg,
                    }}
                    rounded={5}
                    p={2}
                    bgColor={revisionId === id && bg}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" align="center">
                        <LinkOverlay as={Link} to={`./${id}`} fontWeight="bold">
                          {id.slice(0, 8)}
                        </LinkOverlay>
                        <Spacer />
                        <Badge
                          variant="solid"
                          colorScheme={operationsColors[operation]}
                        >
                          {operation}
                        </Badge>
                      </Stack>

                      <Stack direction="row" align="center">
                        <Text fontSize="sm">{author?.username || 'Unknown'}</Text>
                        <Spacer />
                        <Text
                          as="time"
                          opacity={0.6}
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {formatDistanceToNow(new Date(created_at), {
                            addSuffix: true,
                          })}
                        </Text>
                      </Stack>
                    </Stack>
                  </LinkBox>
                ))}
              </Stack>
            </Box>

            <Box flex="1">
              <Outlet />
            </Box>
          </Flex>
        ) : (
          <Alert
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            rounded={5}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              No changes!
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              No changes have been registered as of now. Come back later!
            </AlertDescription>
          </Alert>
        )}
      </Box>
    </>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Stack textAlign="center" mt={20}>
        <Heading>Event Not Found!</Heading>
        <Text>Would you like to create its page?</Text>
        <Box mt={10}>
          <Button
            as={Link}
            to="/events/create"
            m="auto"
            mb={10}
            size="lg"
            colorScheme="teal"
            leftIcon={<AddIcon />}
          >
            Add an event
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default EventChangeLayout;
