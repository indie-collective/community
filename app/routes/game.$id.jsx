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
import {
  Crumb,
  DetailLayout,
  Page,
  PageHeader,
  PageSection,
} from '../components/Page';
import FactSheet from '../components/kit/FactSheet';
import { Row, RowList } from '../components/kit/RowList';
import DateBadge from '../components/kit/DateBadge';
import CountryCode from '../components/kit/CountryCode';
import countryNames from '../assets/countries.json';
import TagList from '../components/TagList';
import { formatEventRange } from '../utils/eventTime';
import { pageMeta, summarize } from '../utils/meta';
import EmptyHint from '../components/EmptyHint';
import { pageRecordId } from '../utils/pageRecord.server';
import { eventPath, gamePath, orgPath } from '../utils/slug';

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
    image: game.game_image?.[0]?.image?.thumbnail_url,
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
  const entities = game_entity.map(({ entity }) => entity);
  const events = game_event.map(({ event }) => event);

  const igdb_images = igdb_game
    ? igdb_game.screenshots.map((image) => ({
        external: true,
        url: image.url.replace('t_thumb', 't_screenshot_huge'),
        thumbnail_url: image.url.replace('t_thumb', 't_screenshot_med'),
      }))
    : [];

  // Where its studios are, and its latest event, for the fact sheet.
  const places = [
    ...new Set(
      entities
        .map(({ location }) =>
          location
            ? [location.city, countryNames[location.country_code]]
                .filter(Boolean)
                .join(', ')
            : null
        )
        .filter(Boolean)
    ),
  ];
  const latest = events.reduce(
    (last, event) =>
      !last || new Date(event.starts_at) > new Date(last.starts_at)
        ? event
        : last,
    null
  );
  const genres = igdb_game?.genres?.map((genre) => genre.name) ?? [];
  const facts = [
    [
      entities.length === 1 ? 'Studio' : 'Studios',
      entities.length > 0 && (
        <Stack gap={0.5}>
          {entities.map((entity) => (
            <ChakraLink asChild key={entity.id}>
              <Link to={orgPath(entity)}>{entity.name}</Link>
            </ChakraLink>
          ))}
        </Stack>
      ),
    ],
    ['Made in', places.length > 0 && places.join('; ')],
    ['Tags', tags.length > 0 && <TagList tags={tags} linked />],
    [
      'Website',
      site && (
        <ChakraLink href={site} target="_blank" rel="noopener noreferrer">
          {site.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          <LuExternalLink />
        </ChakraLink>
      ),
    ],
    [
      'Events',
      latest &&
        `${events.length}, last in ${new Date(latest.starts_at).getUTCFullYear()}`,
    ],
    ['Genres', genres.length > 0 && genres.join(', ')],
    [
      'IGDB',
      game.igdb_slug && (
        <ChakraLink
          href={`https://www.igdb.com/games/${game.igdb_slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          igdb.com
          <LuExternalLink />
        </ChakraLink>
      ),
    ],
  ];

  return (
    <Page>
      <PageHeader
        eyebrow={<Crumb to="/games" list="Games" kind="game" label="Game" />}
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
      <DetailLayout aside={<FactSheet facts={facts} />}>
        <Box mb={{ base: 8, md: 10 }}>
          <Box mb={5}>
            <MotionGallery
              gameId={id}
              images={images.concat(igdb_images)}
              currentUser={currentUser}
              fetcher={fetcher}
            />
          </Box>

          {about && (
            <Box maxW="2xl" fontSize="md">
              <Markdown value={about} />
            </Box>
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
                  key={author.id}
                  {...author}
                  involvement={role ?? 'developer'}
                  onInvolvementChange={
                    currentUser
                      ? (newRole) =>
                          fetcher.submit(
                            { id: author.id, role: newRole },
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
          </PageSection>
        )}
        {events.length > 0 && (
          <PageSection title="Shown at">
            <RowList>
              {events.map((event) => (
                <Row
                  key={event.id}
                  to={eventPath(event)}
                  start={
                    <DateBadge
                      value={event.starts_at}
                      timeZone={event.time_zone}
                    />
                  }
                  title={event.name}
                  sub={formatEventRange(
                    event.starts_at,
                    event.ends_at,
                    event.time_zone,
                    {
                      time: false,
                    }
                  )}
                  end={<CountryCode code={event.location?.country_code} />}
                />
              ))}
            </RowList>
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
      </DetailLayout>
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
