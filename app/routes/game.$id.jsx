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
  Dialog,
  Portal,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { LuPlus, LuExternalLink } from 'react-icons/lu';

import {
  Form,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from 'react-router';
import Link from '../components/Link';

import isAuthenticated from '../utils/isAuthenticated.server';
import { getGame } from '../data/games.server';
import OrgCard from '../components/OrgCard';
// Named, not default: React Router wraps a route module's default export and
// drops the props passed to it here.
import { SearchOrgModal } from './search-org';
import Markdown from '../components/Markdown';
import MotionGallery from '../components/MotionGallery';
import ActionMenu from '../components/ActionMenu';
import { Page, PageHeader, PageSection } from '../components/Page';
import TagList from '../components/TagList';
import { formatEventRange } from '../utils/eventTime';
import { GAME_ROLES } from '../utils/gameRoles';
import { gameShareImage, pageMeta, summarize } from '../utils/meta';
import EmptyHint from '../components/EmptyHint';
import { pageRecordId } from '../utils/pageRecord.server';
import { eventPath, gamePath } from '../utils/slug';

export const loader = async ({ request, params, context }) => {
  // By slug, an old slug or UUID; those redirect to the slug (#209).
  const id = await pageRecordId('game', request, params.id);

  // Stale IGDB data is refreshed after the response (#254).
  const game = await getGame(id, { context });

  if (!game)
    throw new Response('Not Found', {
      status: 404,
    });

  const data = {
    game,
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
  const studios = (game.entities ?? [])
    .map((entity) => entity?.name)
    .filter(Boolean);
  const tags = (game.tags ?? []).map((tag) => tag?.name).filter(Boolean);
  const generated = [
    `Indie game${studios.length ? ` by ${studios.join(', ')}` : ''}`,
    tags.length ? `tagged ${tags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join(', ');
  return pageMeta(matches, {
    title: `${game.name} - Games`,
    shareTitle: game.name,
    description: summarize(game.about) || `${generated}.`,
    image: gameShareImage(game),
    path: gamePath(game),
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
  // A studio with two roles (#335) is credited twice but is one studio.
  const entities = [
    ...new Map(game_entity.map(({ entity }) => [entity.id, entity])).values(),
  ];
  const rolesOf = (orgId) =>
    game_entity
      .filter(({ entity }) => entity.id === orgId)
      .map(({ role }) => role ?? 'developer');
  const events = game_event.map(({ event }) => event);

  const igdb_images = igdb_game
    ? igdb_game.screenshots.map((image) => ({
        external: true,
        url: image.url.replace('t_thumb', 't_screenshot_huge'),
        thumbnail_url: image.url.replace('t_thumb', 't_screenshot_med'),
      }))
    : [];

  // What kind of page this is, and who made it (design pass).
  const makers = entities.slice(0, 2).map((entity) => entity.name);
  const eyebrow = [
    'Game',
    makers.length > 0 &&
      `by ${makers.join(' and ')}${entities.length > 2 ? ' and others' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Page>
      <PageHeader
        eyebrow={eyebrow}
        title={name}
        actions={
          currentUser && (
            <ActionMenu
              editLink={`/game/${id}/edit`}
              changesLink={`/game/${id}/changes`}
              onDelete={deleteModal.onOpen}
            />
          )
        }
      />
      <Box mb={{ base: 8, md: 10 }}>
        <Box mb={5}>
          <MotionGallery
            gameId={id}
            images={images.concat(igdb_images)}
            currentUser={currentUser}
            fetcher={fetcher}
          />
        </Box>

        {tags?.length > 0 && (
          <TagList
            tags={tags}
            size="md"
            fontSize="0.8rem"
            linked
            ml="3px"
            mt="5px"
          />
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
        <PageSection title="Made by">
          <Grid
            gap={5}
            templateColumns={[
              '1fr',
              'repeat(2, 1fr)',
              'repeat(2, 1fr)',
              'repeat(3, 1fr)',
            ]}
          >
            {game_entity.map(({ entity: author, role }) => (
              <OrgCard
                key={`${author.id}-${role}`}
                {...author}
                involvement={role ?? 'developer'}
                // #335: its other roles on this game, which it can't take twice.
                takenRoles={rolesOf(author.id).filter((other) => other !== role)}
                onInvolvementChange={
                  currentUser
                    ? (newRole) =>
                        fetcher.submit(
                          { id: author.id, from: role, role: newRole },
                          {
                            method: 'post',
                            action: `/game/${id}/companies/role`,
                          }
                        )
                    : undefined
                }
                onRemove={
                  currentUser
                    ? () =>
                        fetcher.submit(
                          { id: author.id, role },
                          {
                            method: 'post',
                            action: `/game/${id}/companies/delete`,
                          }
                        )
                    : null
                }
              />
            ))}
            {currentUser && entities.length === 0 && (
              <EmptyHint>
                Who made this game? Add a studio or association.
              </EmptyHint>
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
                  // Credited again, a studio takes another role (#335):
                  // only those with every role are left out.
                  excludedIds={entities
                    .map((entity) => entity.id)
                    .filter((orgId) => rolesOf(orgId).length === GAME_ROLES.length)}
                  onSelect={(author) => {
                    fetcher.submit(
                      { id: author.id },
                      { method: 'post', action: `/game/${id}/companies/add` }
                    );
                  }}
                />
              </>
            )}
          </Grid>
        </PageSection>
      )}
      {events.length > 0 && (
        <PageSection title="Events">
          <List.Root>
            {events.map((event) => (
              <List.Item key={event.id}>
                <ChakraLink asChild>
                  <Link to={eventPath(event)}>
                    <time
                      dateTime={`${new Date(event.starts_at).toISOString()}/${new Date(event.ends_at).toISOString()}`}
                    >
                      {formatEventRange(
                        event.starts_at,
                        event.ends_at,
                        event.time_zone,
                        { time: false }
                      )}
                    </time>
                    . {event.name}
                  </Link>
                </ChakraLink>
              </List.Item>
            ))}
          </List.Root>
        </PageSection>
      )}
      {igdb_game?.videos.length > 0 && (
        <PageSection title="Videos">
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
        </PageSection>
      )}
      {currentUser && (
        <Box>
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
    </Page>
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
