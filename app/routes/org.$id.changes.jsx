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
  Alert,
} from '@chakra-ui/react';
import { useColorModeValue } from '../components/ui/color-mode';
import { LuPlus, LuPencil, LuArrowLeft } from 'react-icons/lu';

import {
  Link,
  NavLink,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useMatches,
  useParams,
  useRouteError,
} from 'react-router';

import { getHistorySubject, listChanges } from '../data/changes.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { formatDistanceToNow } from 'date-fns';
import { pageMeta } from '../utils/meta';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  const currentUser = await isAuthenticated(request, true);

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const org = await getHistorySubject('organization', id);

  if (!org)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    org,
    changes: await listChanges('organization', id),
    currentUser,
  };

  return data;
};

export const meta = ({ data, matches }) => {
  if (!data?.org)
    return [
      {
        title: 'Organization Not Found',
      },
    ];
  const { org } = data;
  return pageMeta(matches, {
    title: `Version history - ${org.name}`,
    description: `Version history of ${org.name}.`,
    path: `/org/${org.id}`,
  });
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
        <ChakraLink asChild>
          <Link to={`/org/${id}`}>
            <LuArrowLeft />
            Back to organization page
          </Link>
        </ChakraLink>
        <Flex direction="row" align="baseline" mt={5}>
          <Heading as="h2" size="2xl">
            {name}
          </Heading>

          <Button ml="auto" asChild>
            <Link to={`/org/${id}/edit`}>
              <LuPencil />
              Edit organization
            </Link>
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

              <Stack w="250px" asChild>
                <List.Root listStyleType="none">
                  {changes.map(({ id, operation, author, created_at }) => (
                    <LinkBox
                      as="li"
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
                      <Stack gap={1}>
                        <Stack direction="row" align="center">
                          <LinkOverlay fontWeight="bold" asChild>
                            <Link to={`./${id}`}>{id.slice(0, 8)}</Link>
                          </LinkOverlay>
                          <Spacer />
                          <Badge
                            variant="solid"
                            colorPalette={operationsColors[operation]}
                          >
                            {operation}
                          </Badge>
                        </Stack>

                        <Stack direction="row" align="center">
                          <Text fontSize="sm">
                            {author?.username || 'Unknown'}
                          </Text>
                          <Spacer />
                          <Text
                            opacity={0.6}
                            fontSize="sm"
                            lineClamp={1}
                            asChild
                          >
                            <time>
                              {formatDistanceToNow(new Date(created_at), {
                                addSuffix: true,
                              })}
                            </time>
                          </Text>
                        </Stack>
                      </Stack>
                    </LinkBox>
                  ))}
                </List.Root>
              </Stack>
            </Box>

            <Box flex="1">
              <Outlet />
            </Box>
          </Flex>
        ) : (
          <Alert.Root
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            rounded={5}
          >
            <Alert.Indicator boxSize="40px" mr={0} />
            <Alert.Title mt={4} mb={1} fontSize="lg">
              No changes!
            </Alert.Title>
            <Alert.Description maxWidth="sm">
              No changes have been registered as of now. Come back later!
            </Alert.Description>
          </Alert.Root>
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
          <Button m="auto" mb={10} size="lg" colorPalette="green" asChild>
            <Link to="/orgs/create">
              <LuPlus />
              Add an organization
            </Link>
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default OrgChangeLayout;
