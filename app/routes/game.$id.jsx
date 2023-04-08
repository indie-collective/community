import {
  Box,
  Stack,
  Heading,
  Text,
  Fade,
  Grid,
  AspectRatio,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  IconButton,
  Tag,
  Link as ChakraLink,
  List,
  ListItem,
  chakra,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  AddIcon,
  ChevronDownIcon,
  EditIcon,
  ExternalLinkIcon,
  RepeatClockIcon,
} from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeGame from '../models/game';
import OrgCard from '../components/OrgCard';
import SearchOrgModal from './search-org';
import Markdown from '../components/Markdown';
import MotionGallery from '../components/MotionGallery';
import EventCard from '../components/EventCard';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const game = await db.game.findUnique({
    where: {
      id,
    },
    include: {
      game_image: {
        include: {
          image: true,
        },
      },
      game_tag: {
        include: {
          tag: true,
        },
      },
      game_entity: {
        include: {
          entity: {
            include: {
              logo: true,
            },
          },
        },
      },
      game_event: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!game)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    game: await computeGame(game),
    currentUser: await authenticator.isAuthenticated(request),
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
    title: `${game.name} - Games`,
    'og:title': game.name,
    'og:description': `${game.about}.`,
    'og:url': `${location.protocol}://${location.host}/game/${game.id}`,
    'og:image': game.game_image[0]?.image.thumbnail_url,
    'twitter:card': game.game_image[0] ? 'summary_large_image' : 'summary',
    'twitter:site': '@IndieColle',
    'twitter:title': game.name,
    'twitter:description': `${game.about}.`,
    'twitter:image': game.game_image[0]?.image.thumbnail_url,
  };
};

const Game = () => {
  const { game, currentUser } = useLoaderData();
  const fetcher = useFetcher();
  const bg = useColorModeValue('white', 'gray.900');

  const {
    isOpen: linkAuthorIsOpen,
    onOpen: onOpenLinkAuthor,
    onClose: onCloseLinkAuthor,
  } = useDisclosure();

  const deleteModal = useDisclosure();

  const {
    id,
    name,
    site,
    about,
    game_image,
    game_entity,
    game_tag,
    game_event,
    igdb_game,
  } = game;
  const images = game_image.map(({ image }) => image);
  const tags = game_tag.map(({ tag }) => tag);
  const entities = game_entity.map(({ entity }) => entity);
  const events = game_event.map(({ event }) => event);

  const dateTimeFormat = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const igdb_images = igdb_game
    ? igdb_game.screenshots.map((image) => ({
        external: true,
        url: image.url.replace('t_thumb', 't_screenshot_huge'),
        thumbnail_url: image.url.replace('t_thumb', 't_screenshot_med'),
      }))
    : [];

  return (
    <Box mb={5} p={5}>
      <Flex direction="row" align="center">
        <Heading as="h2" noOfLines={1} title={name} size="2xl" flex="auto">
          {name}
        </Heading>

        {currentUser && (
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              Actions
            </MenuButton>
            <MenuList>
              <MenuItem
                as={Link}
                to={`/game/${id}/edit`}
                icon={<EditIcon />}
                colorScheme="teal"
              >
                Edit
              </MenuItem>
              <MenuItem
                as={Link}
                to={`/game/${id}/changes`}
                icon={<RepeatClockIcon />}
              >
                History
              </MenuItem>
              <MenuDivider />
              <MenuItem color="red" onClick={deleteModal.onOpen}>
                Delete game
              </MenuItem>
            </MenuList>
          </Menu>
        )}

        <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
          <ModalOverlay />
          <ModalContent as={Form} action={`/game/${id}/delete`} method="post">
            <ModalHeader>Delete Game</ModalHeader>
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
      </Flex>

      <Box
        background={bg}
        maxWidth="36em"
        shadow="sm"
        borderRadius={7}
        padding={4}
        mt={5}
      >
        {about && <Markdown value={about} />}
        {site && (
          <ChakraLink href={site} isExternal>
            Website
            <ExternalLinkIcon mx="2px" />
          </ChakraLink>
        )}
        <Stack isInline spacing={2} mt={5}>
          {tags.map((tag) => (
            <Tag key={tag.id} colorScheme="teal">
              {tag.name}
            </Tag>
          ))}
        </Stack>
      </Box>

      <Box background={bg} shadow="sm" borderRadius={7} padding={4} mt={5}>
        <MotionGallery
          gameId={id}
          images={images.concat(igdb_images)}
          currentUser={currentUser}
          fetcher={fetcher}
        />
      </Box>

      <Box background={bg} shadow="sm" borderRadius={7} padding={4} mt={5}>
        <Heading size="md" mb={2}>
          Authors
        </Heading>

        <Grid
          gap={5}
          templateColumns={[
            '1fr',
            'repeat(2, 1fr)',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
          ]}
        >
          {entities.map((author) => (
            <OrgCard
              key={author.id}
              {...author}
              onRemove={
                currentUser
                  ? () =>
                      fetcher.submit(
                        { id: author.id },
                        {
                          method: 'post',
                          action: `/game/${id}/companies/delete`,
                        }
                        // { method: 'post', action: './companies/delete' }
                      )
                  : null
              }
            />
          ))}
          {currentUser && (
            <>
              <IconButton
                alignSelf="center"
                justifySelf="flex-start"
                colorScheme="teal"
                aria-label="Add an author to the game"
                icon={<AddIcon />}
                onClick={onOpenLinkAuthor}
              />
              <SearchOrgModal
                isOpen={linkAuthorIsOpen}
                onClose={onCloseLinkAuthor}
                excludedIds={entities.map(({ id }) => id)}
                onSelect={(author) => {
                  fetcher.submit(
                    { id: author.id },
                    { method: 'post', action: `/game/${id}/companies/add` }
                    // { method: 'post', action: './companies/add' }
                  );
                }}
              />
            </>
          )}
        </Grid>
      </Box>

      {events.length > 0 && (
        <Box background={bg} shadow="sm" borderRadius={7} padding={4} mt={5}>
          <Heading size="md" mb={2}>
            Events
          </Heading>

          <Grid
            gap={3}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
              'repeat(3, 1fr)',
            ]}
          >
            {events.map((event) => (
              <Box key={event.id} minW={0}>
                <EventCard
                  id={event.id}
                  name={event.name}
                  status={event.status}
                  cover={event.cover}
                  location={event.location}
                  game_event={[]}
                  event_participant={[]}
                  starts_at={event.starts_at}
                  ends_at={event.ends_at}
                />
              </Box>
            ))}
          </Grid>
        </Box>
      )}

      {igdb_game?.videos.length > 0 && (
        <Box mb={5} pl={5} pr={5}>
          <Heading size="md" mb={2}>
            Videos
          </Heading>
          <Grid
            gap={3}
            templateColumns={[
              'repeat(1, 1fr)',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
            ]}
          >
            {igdb_game?.videos?.map(({ id, name, video_id }) => (
              <AspectRatio key={id} ratio={16 / 9}>
                <chakra.iframe
                  objectFit="cover"
                  width="100%"
                  height="100%"
                  title={name}
                  src={`https://www.youtube.com/embed/${video_id}`}
                  allowFullScreen
                />
              </AspectRatio>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export function CatchBoundary() {
  return (
    <Stack textAlign="center" mt={20}>
      <Heading>Game not found!</Heading>
      <Text>Would you like to create its page?</Text>
      <Box mt={10}>
        <Button
          as={Link}
          to="/games/create"
          m="auto"
          mb={10}
          size="lg"
          leftIcon={<AddIcon />}
        >
          Add a game
        </Button>
      </Box>
    </Stack>
  );
}

export default Game;
