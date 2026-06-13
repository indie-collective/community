import {
    Box,
  Text,
  Heading,
  Spinner,
  Badge,
  Grid,
  Image,
  Flex,
  Button,
  useDisclosure,
  Link as ChakraLink,
  Stack,
  Dialog,
  Portal,
} from '@chakra-ui/react';
import { DarkMode } from '../components/ui/color-mode';
import { LuPlus, LuPencil, LuExternalLink, LuMapPin } from 'react-icons/lu';

import {
  Link,
  useLoaderData,
  useNavigate,
  Form,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import countryNames from '../assets/countries.json';
import computeOrg from '../models/org';
import GameCard from '../components/GameCard';
import EventCard from '../components/EventCard';
import usePlaceholder from '../hooks/usePlaceholder';
import Markdown from '../components/Markdown';
import ActionMenu from '../components/ActionMenu';

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
};

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const variants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
};

export const loader = async ({ request, params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const currentUser = await isAuthenticated(request);

  const org = await db.entity.findUnique({
    where: { id },
    include: {
      game_entity: {
        where: {
          game: {
            deleted: false,
          },
        },
        include: {
          game: {
            include: {
              game_image: {
                include: {
                  image: true,
                },
              },
            },
          },
        },
        orderBy: {
          game: {
            created_at: 'desc',
          },
        },
      },
      entity_event: {
        include: {
          event: {
            include: {
              game_event: {
                where: {
                  game: {
                    deleted: false,
                  },
                },
              },
              event_participant: true,
              cover: true,
            },
          },
        },
        orderBy: {
          event: {
            ends_at: 'desc',
          },
        },
      },
      logo: true,
      location: true,
    },
  });

  if (!org) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  return {
    org: await computeOrg(org),
    currentUser,
  };
};

export const meta = ({ data, location }) =>
  data?.org
    ? [
        { title: data.org.name },
        { name: 'description', content: `${data.org.about}.` },
        { property: 'og:title', content: data.org.name },
        { property: 'og:description', content: `${data.org.about}.` },
        {
          property: 'og:url',
          content: `${location.protocol}://${location.host}/org/${data.org.id}`,
        },
        { property: 'og:image', content: data.org.logo?.thumbnail_url },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: data.org.name },
        { name: 'twitter:description', content: `${data.org.about}.` },
        { name: 'twitter:image', content: data.org.logo?.thumbnail_url },
      ]
    : [{ title: 'Organization not found!' }];

const Org = () => {
  const navigate = useNavigate();
  const placeholder = usePlaceholder('square');
  const { org, currentUser } = useLoaderData();

  const deleteModal = useDisclosure();

  const {
    id,
    name,
    type,
    site,
    about,
    location,
    logo,
    game_entity,
    entity_event,
  } = org;

  const games = game_entity.map(({ game }) => game);
  const events = entity_event.map(({ event }) => event);

  return (
    <>
      <Box mt={[5, 2, 5]} padding={[0, 5]} px={5}>
        <Flex alignItems="center">
          <Image
            w="100px"
            h="100px"
            objectFit="cover"
            src={logo?.thumbnail_url ?? placeholder}
            alt="Organization cover"
            rounded={3}
          />

          <Box flex="1" ml={2}>
            <Heading lineClamp={1} title={name}>
              {name}
            </Heading>
            <DarkMode>
              <Badge
                rounded={3}
                variant="solid"
                colorPalette={TYPES_COLORS[type]}
              >
                {type}
              </Badge>
            </DarkMode>
            {site && (
              <ChakraLink
                href={site}
                ml={2}
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.replace(/https?:\/\//, '')}
                <LuExternalLink mx="2px" />
              </ChakraLink>
            )}
            {location && (
              <Text>
                <LuMapPin />{' '}
                {location.region && (
                  <>
                    {location.city && <>{location.city}, </>}
                    {location.region},{' '}
                  </>
                )}
                <ChakraLink asChild>
                  <Link to={`/country/${location.country_code.toLowerCase()}`}>
                    {countryNames[location.country_code]}
                  </Link>
                </ChakraLink>
              </Text>
            )}
          </Box>

          {currentUser && (
            <ActionMenu
              ml="auto"
              editLink={`/org/${id}/edit`}
              changesLink={`/org/${id}/changes`}
              onDelete={deleteModal.onOpen}
            />
          )}
        </Flex>

        {currentUser && (
          <Link to={`/org/${id}/edit`}>
            <Button colorPalette="green" mt={3}>
              <LuPencil />
              Edit
            </Button>
          </Link>
        )}

        {about && (
          <Box mt={3}>
            <Markdown value={about} />
          </Box>
        )}
      </Box>
      {games.length > 0 && (
        <Box pl={5} pr={5} mb={5}>
          <Heading size="md" mb={2}>
            Games
            <Badge
              verticalAlign="baseline"
              fontSize="md"
              ml={2}
              variant="subtle"
              colorPalette="green"
            >
              {games.length}
            </Badge>
          </Heading>

          <Box
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid
              gap={3}
              templateColumns={[
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {games.map((game) => (
                <Box minW={0} key={game.id}>
                  <Box variants={variants}>
                    <GameCard {...game} />
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      )}
      {events.length > 0 && (
        <Box pl={5} pr={5} mb={5}>
          <Heading size="md" mb={2}>
            Hosted events
            <Badge
              verticalAlign="baseline"
              fontSize="md"
              ml={2}
              variant="subtle"
              colorPalette="green"
            >
              {events.length}
            </Badge>
          </Heading>

          <Box
            initial="initial"
            animate="enter"
            exit="exit"
            variants={{ enter: { transition: { staggerChildren: 0.1 } } }}
          >
            <Grid
              gap={3}
              templateColumns={[
                'repeat(2, 1fr)',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(4, 1fr)',
              ]}
            >
              {events.map((event) => (
                <Box minW={0} key={event.id}>
                  <Box variants={variants}>
                    <EventCard {...event} />
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>
        </Box>
      )}
      {currentUser && (
        <Box mb={5} pl={5} pr={5}>
          <Dialog.Root
            open={deleteModal.open}
            onOpenChange={(e) => {
              if (!e.open) {
                deleteModal.onClose();
              }
            }}
          >
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content action={`./delete`} method="post" asChild>
                  <Form>
                    <Dialog.Header>Delete Organisation</Dialog.Header>
                    <Dialog.CloseTrigger />
                    <Dialog.Body>
                      <Text>Do you really want to delete {name}?</Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Button
                        type="submit"
                        loading={false}
                        loadingText="Deleting"
                        colorPalette="red"
                        mr={3}
                      >
                        Delete
                      </Button>
                      <Button variant="ghost" onClick={deleteModal.onClose}>
                        Cancel
                      </Button>
                    </Dialog.Footer>
                  </Form>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Box>
      )}
    </>
  );
};

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <Stack textAlign="center" mt={20}>
        <Heading>Organization not found!</Heading>
        <Text>Would you like to create its page?</Text>
        <Box mt={10}>
          <Button m="auto" mb={10} size="lg" asChild>
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

export default Org;
