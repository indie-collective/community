import {
  Box,
  Stack,
  Heading,
  Text,
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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeGame from '../models/game';
import OrgCard from '../components/OrgCard';
import SearchOrgModal from './search-org';
import Markdown from '../components/Markdown';
import MotionGallery from '../components/MotionGallery';

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
    <>
      <Box mb={5} pl={5} pr={5} mt={5}>
        <Flex direction="row" align="center">
          <Heading as="h2" noOfLines={1} title={name} size="2xl">
            {name}
          </Heading>

          {currentUser && (
            <>
              <ChakraLink to={`/game/${id}/changes`} as={Link} ml="auto">
                Changes History
              </ChakraLink>
              <Button
                as={Link}
                to={`/game/${id}/edit`}
                leftIcon={<EditIcon />}
                colorScheme="teal"
                ml={3}
              >
                Edit
              </Button>
            </>
          )}
        </Flex>

        {site && (
          <Text fontSize="lg">
            <ChakraLink href={site} isExternal>
              {site.replace(/https?:\/\//, '')}
              <ExternalLinkIcon mx="2px" />
            </ChakraLink>
          </Text>
        )}

        {about && (
          <Box mt={3}>
            <Markdown value={about} />
          </Box>
        )}

        <Stack isInline spacing={2} mt={5}>
          {tags.map((tag) => (
            <Tag key={tag.id} colorScheme="teal">
              {tag.name}
            </Tag>
          ))}
        </Stack>
      </Box>

      <Box mb={5} pl={5} pr={5}>
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
        <Box mb={5} pl={5} pr={5}>
          <Heading size="md" mb={2}>
            Made/Exhibited at:
          </Heading>
          <List>
            {events.map((event) => (
              <ListItem key={event.key}>
                <ChakraLink as={Link} to={`/event/${event.id}`}>
                  <time dateTime={event.starts_at + '/' + event.ends_at}>
                    {dateTimeFormat.formatRange(
                      new Date(event.starts_at),
                      new Date(event.ends_at)
                    )}
                  </time>
                  . {event.name}
                </ChakraLink>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Box mb={5} pl={5} pr={5}>
        <MotionGallery
          gameId={id}
          images={images.concat(igdb_images)}
          currentUser={currentUser}
          fetcher={fetcher}
        />
      </Box>

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

      {currentUser && (
        <Box mb={5} pl={5} pr={5}>
          <Button variant="link" colorScheme="red" onClick={deleteModal.onOpen}>
            Delete game
          </Button>

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
        </Box>
      )}
    </>
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
