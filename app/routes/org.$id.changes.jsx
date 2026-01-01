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
import computeOrg from '../models/org';
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

  const org = await db.entity.findUnique({
    where: {
      id,
    },
  });

  if (!org)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    org: await computeOrg(org),
    changes: await db.change.findMany({
      where: {
        record_id: org.id,
        table_name: 'entity',
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
  if (!data?.org)
    return {
      title: 'Organization Not Found',
    };

  const { org } = data;

  return {
    title: `Version history - ${org.name}`,
    'og:title': `Version history - ${org.name}`,
    'og:description': `Version history of ${org.name}.`,
    'og:url': `${location.protocol}://${location.host}/org/${org.id}`,
    'twitter:site': '@IndieColle',
    'twitter:title': `Version history - ${org.name}`,
    'twitter:description': `Version history of ${org.name}.`,
  };
};

const operationsColors = {
  create: 'green',
  update: 'blue',
  delete: 'red',
};

const OrgChangeLayout = () => {
  const { org, changes } = useLoaderData();
  const { revisionId } = useParams();

  const bg = useColorModeValue('gray.100', 'gray.700');

  const { id, name } = org;

  return (
    <>
      <Box mb={5} pl={5} pr={5} mt={5}>
        <ChakraLink as={Link} to={`/org/${id}`}>
          <ArrowBackIcon />
          Back to organization page
        </ChakraLink>
        <Flex direction="row" align="baseline" mt={5}>
          <Heading as="h2" size="2xl">
            {name}
          </Heading>

          <Button
            as={Link}
            to={`/org/${id}/edit`}
            leftIcon={<EditIcon />}
            ml="auto"
          >
            Edit organization
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
        <Heading>Organization Not Found!</Heading>
        <Text>Would you like to create its page?</Text>
        <Box mt={10}>
          <Button
            as={Link}
            to="/orgs/create"
            m="auto"
            mb={10}
            size="lg"
            colorScheme="green"
            leftIcon={<AddIcon />}
          >
            Add an organization
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default OrgChangeLayout;
