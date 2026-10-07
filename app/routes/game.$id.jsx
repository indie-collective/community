import {
  Box,
  Stack,
  Heading,
  Text,
  Grid,
  AspectRatio,
  Button,
  useDisclosure,
  IconButton,
  List,
  Flex,
  Dialog,
  Portal,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { LuPlus, LuPencil, LuExternalLink } from 'react-icons/lu';

import {
  Form,
  Link,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from 'react-router';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import computeGame from '../models/game';
import { refreshIfStale } from '../utils/igdbData.server';
import OrgCard from '../components/OrgCard';
// Named, not default: React Router wraps a route module's default export and
// drops the props passed to it here.
import { SearchOrgModal } from './search-org';
import Markdown from '../components/Markdown';
import MotionGallery from '../components/MotionGallery';
import ActionMenu from '../components/ActionMenu';
import TagList from '../components/TagList';
import { formatEventRange } from '../utils/eventTime';
import { pageMeta, summarize } from '../utils/meta';
import EmptyHint from '../components/EmptyHint';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params, context }) => {
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
      igdb: true,
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

  // Never waits for IGDB: stale data shows now and is refreshed afterwards.
  refreshIfStale(db, game, context);

  const data = {
    game: await computeGame(game),
    currentUser: await isAuthenticated(request),
  };

  return data;
};

export const meta = ({ data, matches }) => {
  if (!data?.game)
    return [
      {
        title: 'Game Not Found',
      },
    ];
  const { game } = data;
  // Without an "about", describe it from what we know (#196).
  const studios = (game.entities ?? []).map((entity) => entity?.name).filter(Boolean);
  const tags = (game.tags ?? []).map((tag) => tag?.name).filter(Boolean);
  const generated = [`Indie game${studios.length ? ` by ${studios.join(', ')}` : ''}`, tags.length ? `tagged ${tags.join(', ')}` : '']
    .filter(Boolean)
    .join(', ');
  return pageMeta(matches, {
    title: `${game.name} - Games`,
    shareTitle: game.name,
    description: summarize(game.about) || `${generated}.`,
    image: game.game_image?.[0]?.image?.thumbnail_url,
    path: `/game/${game.id}`,
  });
};

const Game = () => {
  const { game, currentUser } = useLoaderData();
  const fetcher = useFetcher();

  const {
    open: linkAuthorIsOpen,
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
        <Flex direction="row" align="center" mb={5}>
          <Heading as="h2" lineClamp={1} title={name} size="2xl" pb={1}>
            {name}
          </Heading>

          {currentUser && (
            <ActionMenu
              ml="auto"
              editLink={`/game/${id}/edit`}
              changesLink={`/game/${id}/changes`}
              onDelete={deleteModal.onOpen}
            />
          )}
        </Flex>

        <Box mb={5}>
          <MotionGallery
            gameId={id}
            images={images.concat(igdb_images)}
            currentUser={currentUser}
            fetcher={fetcher}
          />
        </Box>

        {tags?.length > 0 && (
          <TagList tags={tags} size="md" fontSize="0.8rem" linked ml="3px" mt="5px" />
        )}

        {about && (
          <Box py={3} maxW="540px">
            <Markdown value={about} />
          </Box>
        )}

        {site && (
          <Button asChild>
            <ChakraLink
              href={site}
              title={site.replace(/https?:\/\//, '')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
              <LuExternalLink />
            </ChakraLink>
          </Button>
        )}
      </Box>
      {(currentUser || entities.length > 0) && (
      <Box mb={5} pl={5} pr={5}>
        <Heading size="md" mb={2}>
          Made by
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
          {currentUser && entities.length === 0 && (
            <EmptyHint>Who made this game? Add a studio or association.</EmptyHint>
          )}
          {currentUser && (
            <>
              <IconButton
                alignSelf="center"
                justifySelf="flex-start"
                colorPalette="green"
                aria-label="Add an author to the game"
                onClick={onOpenLinkAuthor}
              >
                <LuPlus />
              </IconButton>
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
      )}
      {events.length > 0 && (
        <Box mb={5} pl={5} pr={5}>
          <Heading size="md" mb={2}>
            Made/Exhibited at:
          </Heading>
          <List.Root>
            {events.map((event) => (
              <List.Item key={event.key}>
                <ChakraLink asChild>
                  <Link to={`/event/${event.id}`}>
                    <time dateTime={`${new Date(event.starts_at).toISOString()}/${new Date(event.ends_at).toISOString()}`}>
                      {formatEventRange(event.starts_at, event.ends_at, event.time_zone, { time: false })}
                    </time>
                    . {event.name}
                  </Link>
                </ChakraLink>
              </List.Item>
            ))}
          </List.Root>
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
                <Box
                  as="iframe"
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
                <Dialog.Content
                  action={`/game/${id}/delete`}
                  method="post"
                  asChild
                >
                  <Form>
                    <Dialog.Header>Delete Game</Dialog.Header>
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
        <Heading>Game not found!</Heading>
        <Text>Why not create its page?</Text>
        <Box mt={10}>
          <Button m="auto" mb={10} size="lg" asChild>
            <Link to="/games/create">
              <LuPlus />
              Add game
            </Link>
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Text>Something went wrong.</Text>;
}

export default Game;
