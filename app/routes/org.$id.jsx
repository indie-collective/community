import {
  Box,
  Text,
  Heading,
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
  HStack,
} from '@chakra-ui/react';

import { LuPlus, LuExternalLink, LuMapPin } from 'react-icons/lu';

import {
  useLoaderData,
  Form,
  isRouteErrorResponse,
  useRouteError,
} from 'react-router';
import Link from '../components/Link';

import isAuthenticated from '../utils/isAuthenticated.server';
import countryNames from '../assets/countries.json';
import { getOrganization } from '../data/organizations.server';
import GameCard from '../components/GameCard';
import { gameRoleLabel } from '../utils/gameRoles';
import EventCard from '../components/EventCard';
import PlaceMap from '../components/PlaceMap';
import usePlaceholder from '../hooks/usePlaceholder';
import Markdown from '../components/Markdown';
import ActionMenu from '../components/ActionMenu';
import ShareMenu from '../components/ShareMenu';
import EmbedCode from '../components/EmbedCode';
import OpportunityList from '../components/OpportunityList';
import { listOpportunities } from '../data/opportunities.server';
import { isFollowing } from '../data/notifications.server';
import FollowButton from '../components/FollowButton';
import { ReportDuplicate } from '../components/Duplicates';
import { SubscribeMenu } from '../components/CalendarMenus';
import { Page, PageHeader, PageSection } from '../components/Page';
import { pageMeta, shareImage, summarize } from '../utils/meta';
import SectionHeading from '../components/SectionHeading';
import {
  ORG_STATUSES,
  orgStatusLabel,
  orgTypeLabel,
  pinColor,
} from '../utils/orgTypes';
import EmptyHint from '../components/EmptyHint';
import { FaBluesky } from 'react-icons/fa6';
import { pageRecordId } from '../utils/pageRecord.server';
import { orgPath } from '../utils/slug';

export const loader = async ({ request, params }) => {
  // By slug, an old slug or UUID; those redirect to the slug (#209).
  const id = await pageRecordId('organization', request, params.id);

  const currentUser = await isAuthenticated(request);

  const org = await getOrganization(id);

  if (!org) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

  return {
    org,
    currentUser,
    opportunities: await listOpportunities({ organizationId: id }),
    following: await isFollowing(currentUser?.id, 'organization', id),
  };
};

export const meta = ({ data, matches }) => {
  if (!data?.org) return [{ title: 'Organization not found!' }];
  const { org } = data;
  // Without an "about", describe it from what we know (#196).
  const kind =
    org.type === 'association' ? 'Video game association' : 'Video game studio';
  const place = [org.location?.city, org.location?.country_code]
    .filter(Boolean)
    .join(', ');
  return pageMeta(matches, {
    title: org.name,
    description:
      summarize(org.about) || `${kind}${place ? ` in ${place}` : ''}.`,
    image: shareImage(org.logo, org.name),
    path: orgPath(org),
  });
};

const Org = () => {
  const placeholder = usePlaceholder('square');
  const { org, currentUser, opportunities, following } = useLoaderData();

  const deleteModal = useDisclosure();
  // #346
  const reportModal = useDisclosure();

  const {
    id,
    name,
    type,
    status,
    site,
    bsky_handle,
    about,
    location,
    logo,
    game_entity,
    entity_event,
  } = org;

  const games = game_entity.map(({ game }) => game);
  // Each game once per section, with every role it had there (#335).
  const byGame = (links) => [
    ...links
      .reduce((all, { game, role }) => {
        const roles = all.get(game.id)?.roles ?? [];
        return all.set(game.id, {
          game,
          roles: [...roles, role ?? 'developer'],
        });
      }, new Map())
      .values(),
  ];
  const published = byGame(
    game_entity.filter(({ role }) => role === 'publisher')
  );
  const made = byGame(game_entity.filter(({ role }) => role !== 'publisher'));
  const events = entity_event.map(({ event }) => event);

  return (
    <Page>
      <Flex gap={{ base: 4, md: 5 }} align="flex-start" mb={{ base: 6, md: 8 }}>
        <Image
          boxSize={{ base: '72px', md: '96px' }}
          flexShrink={0}
          objectFit="cover"
          src={logo?.thumbnail_url ?? placeholder}
          alt=""
          borderRadius="lg"
          bg="surface"
          // The clicked card's image moves here (view transitions, CardLink).
          data-vt-hero=""
          css={{ viewTransitionName: 'record-image' }}
        />
        <PageHeader
          flex="1"
          minW={0}
          mb={0}
          // What kind of page this is, and where (design pass).
          eyebrow={[
            orgTypeLabel(type),
            location &&
              [location.city, countryNames[location.country_code]]
                .filter(Boolean)
                .join(', '),
          ]
            .filter(Boolean)
            .join(' · ')}
          title={name}
          actions={
            <>
              <ShareMenu title={name} path={orgPath(org)} />
              {currentUser && <FollowButton type="organization" id={id} following={following} />}
              {/* #342: its events in a calendar app. */}
              {entity_event.length > 0 && (
                <SubscribeMenu label="Events calendar" calendarPath={`${orgPath(org)}/calendar.ics`} />
              )}
              {currentUser && (
                <ActionMenu
                  editLink={`/org/${id}/edit`}
                  onDelete={currentUser.isAdmin ? deleteModal.onOpen : undefined}
                onReportDuplicate={reportModal.onOpen}
                />
              )}
            </>
          }
        >
          <HStack gap={4} wrap="wrap" fontSize="sm" color="muted">
            {status && status !== 'active' && (
              <Badge colorPalette={ORG_STATUSES[status]?.color}>
                {orgStatusLabel(status)}
              </Badge>
            )}
            {location && (
              <HStack gap={1}>
                <LuMapPin />
                <Text>
                  {[location.city, location.region].filter(Boolean).join(', ')}
                  {(location.city || location.region) && ', '}
                  <ChakraLink asChild>
                    <Link
                      to={`/country/${location.country_code.toLowerCase()}`}
                    >
                      {countryNames[location.country_code]}
                    </Link>
                  </ChakraLink>
                </Text>
              </HStack>
            )}
            {site && (
              <ChakraLink href={site} target="_blank" rel="noopener noreferrer">
                {site.replace(/https?:\/\//, '').replace(/\/$/, '')}
                <LuExternalLink />
              </ChakraLink>
            )}
            {bsky_handle && (
              <ChakraLink
                href={`https://bsky.app/profile/${bsky_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Bluesky: @${bsky_handle}`}
              >
                <FaBluesky />@{bsky_handle}
              </ChakraLink>
            )}
          </HStack>
        </PageHeader>
      </Flex>

      {/* #337: where it is, at city level. */}
      {location?.latitude && location?.longitude && (
        <PlaceMap
          location={location}
          id={id}
          color={pinColor(type)}
          logo={logo}
          label={
            [location.city, countryNames[location.country_code]]
              .filter(Boolean)
              .join(', ') || name
          }
        />
      )}

      {about && (
        <Box mb={{ base: 8, md: 10 }} maxW="2xl">
          <Markdown value={about} />
        </Box>
      )}
      {[
        // #331: what it published apart from what it made or helped with.
        ['Games', made],
        ['Published', published],
      ].map(
        ([heading, links]) =>
          links.length > 0 && (
            <Box as="section" mb={{ base: 8, md: 10 }} key={heading}>
              <SectionHeading mb={4} count={links.length} countLabel="games">
                {heading}
              </SectionHeading>
              <Grid
                gap={3}
                templateColumns={[
                  'repeat(2, 1fr)',
                  'repeat(2, 1fr)',
                  'repeat(3, 1fr)',
                  'repeat(4, 1fr)',
                ]}
              >
                {links.map(({ game, roles }) => (
                  <Box minW={0} key={game.id}>
                    <GameCard {...game} />
                    {/* #40: how this organisation took part, when not only as the developer. */}
                    {roles.some(
                      (role) => role !== 'developer' && role !== 'publisher'
                    ) && (
                      <Text fontSize="sm" color="muted" mt={1}>
                        {roles.map(gameRoleLabel).join(', ')}
                      </Text>
                    )}
                  </Box>
                ))}
              </Grid>
            </Box>
          )
      )}
      {events.length > 0 && (
        <Box as="section" mb={{ base: 8, md: 10 }}>
          <SectionHeading mb={4} count={events.length} countLabel="events">
            Hosted events
          </SectionHeading>
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
      {/* Empty sections stay hidden from visitors; members get a way in (#198). */}
      {currentUser && (games.length === 0 || events.length === 0) && (
        <Box mb={{ base: 8, md: 10 }}>
          {games.length === 0 && (
            <EmptyHint mb={1}>
              No games yet.{' '}
              <ChakraLink asChild textDecoration="underline">
                <Link to="/games/create">Add a game</Link>
              </ChakraLink>
              , then link this organization from its page.
            </EmptyHint>
          )}
          {events.length === 0 && (
            <EmptyHint>
              No hosted events yet.{' '}
              <ChakraLink asChild textDecoration="underline">
                <Link to="/events/create">Add an event</Link>
              </ChakraLink>
              , then add this organization as an organizer.
            </EmptyHint>
          )}
        </Box>
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
      {/* #345: what it's looking for. */}
      {(opportunities.length > 0 || currentUser) && (
        <PageSection
          title="Opportunities"
          aside={
            currentUser && (
              <Button asChild size="sm" variant="outline">
                <Link to={`/opportunities/new?for=organization:${id}`}>Post an opportunity</Link>
              </Button>
            )
          }
        >
          {opportunities.length > 0 ? (
            <OpportunityList opportunities={opportunities} currentUser={currentUser} showFor={false} />
          ) : (
            <EmptyHint>Hiring, looking for playtesters or pitches? Post it here.</EmptyHint>
          )}
        </PageSection>
      )}
      {/* #349: its games or events on its own site. */}
      {(games.length > 0 || events.length > 0) && <EmbedCode org={org} hasGames={games.length > 0} hasEvents={events.length > 0} />}
      {currentUser && (
        <ReportDuplicate kind="organization" id={id} isOpen={reportModal.open} onClose={reportModal.onClose} />
      )}
    </Page>
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
