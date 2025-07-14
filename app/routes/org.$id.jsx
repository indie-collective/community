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
} from '@chakra-ui/react';
import { FiEdit, FiExternalLink, FiPlus, FiAlertTriangle } from 'react-icons/fi';
import { json } from '@remix-run/node';
import {
  Link,
  useLoaderData,
  useNavigate,
  Form,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';


import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import countryNames from '../assets/countries.json';
import computeOrg from '../models/org';
import GameCard from '../components/GameCard';
import EventCard from '../components/EventCard';
import usePlaceholder from '../hooks/usePlaceholder';
import { LocationIcon } from '../components/LocationIcon';
import Markdown from '../components/Markdown';

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
};

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;



export const loader = async ({ request, params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const currentUser = await authenticator.isAuthenticated(request);

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

  return json({
    org: await computeOrg(org),
    currentUser,
  });
};

export const meta = ({ data, location }) =>
  data?.org
    ? {
        title: data.org.name,
        description: `${data.org.about}.`,
        'og:title': data.org.name,
        'og:description': `${data.org.about}.`,
        'og:url': `${location.protocol}://${location.host}/org/${data.org.id}`,
        'og:image': data.org.logo?.thumbnail_url,
        'twitter:card': 'summary',
        'twitter:title': data.org.name,
        'twitter:description': `${data.org.about}.`,
        'twitter:image': data.org.logo?.thumbnail_url,
      }
    : {
        title: 'Organization not found!',
      };

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
            src={logo && logo.thumbnail_url}
            alt="Organization cover"
            fallbackSrc={placeholder}
            rounded={3}
          />

          <Box flex="1" ml={2}>
            <Heading noOfLines={1} title={name}>
              {name}
            </Heading>
            <Badge
            rounded={3}
            variant="solid"
            colorScheme={TYPES_COLORS[type]}
          >
            {type}
          </Badge>
            {site && (
              <ChakraLink href={site} target="_blank" rel="noopener noreferrer" ml={2}>
                {site.replace(/https?:\/\//, '')}
                <FiExternalLink style={{ display: 'inline' }} />
              </ChakraLink>
            )}
            {location && (
              <Text>
                <LocationIcon />{' '}
                {location.region && (
                  <>
                    {location.city && <>{location.city}, </>}
                    {location.region},{' '}
                  </>
                )}
                <ChakraLink
                  as={Link}
                  to={`/country/${location.country_code.toLowerCase()}`}
                >
                  {countryNames[location.country_code]}
                </ChakraLink>
              </Text>
            )}
          </Box>
        </Flex>

        {currentUser && (
          <Link to={`/org/${id}/edit`}>
            <Button leftIcon={<FiEdit />} colorScheme="teal" mt={3}>
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
              colorScheme="teal"
            >
              {games.length}
            </Badge>
          </Heading>

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
                <GameCard {...game} />
              </Box>
            ))}
          </Grid>
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
              colorScheme="teal"
            >
              {events.length}
            </Badge>
          </Heading>

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
                <EventCard {...event} />
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {currentUser && (
        <Box mb={5} pl={5} pr={5}>
          <Button variant="link" colorScheme="red" onClick={deleteModal.onOpen}>
            Delete organization
          </Button>

          <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
            <ModalOverlay />
            <ModalContent as={Form} action={`./delete`} method="post">
              <ModalHeader>Delete Organisation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Do you really want to delete {name}?</Text>
              </ModalBody>

              <ModalFooter>
                <Button
                  type="submit"
                  isLoading={false}
                  loadingText="Deleting"
                  colorScheme="red"
                  mr={3}
                >
                  Delete
                </Button>
                <Button variant="ghost" onClick={deleteModal.onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
          <Button
            as={Link}
            to="/orgs/create"
            m="auto"
            mb={10}
            size="lg"
            leftIcon={<FiPlus />}
          >
            Add an organization
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default Org;
