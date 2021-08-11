import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Text,
  Heading,
  Spinner,
  Badge,
  DarkMode,
  Grid,
  Image,
  Flex,
  Button,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
  ModalHeader,
  Link as ChakraLink,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import Error from '../_error';
import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import EventCard from '../../components/EventCard';
import usePlaceholder from '../../hooks/usePlaceholder';
import useCurrentPerson from '../../hooks/useCurrentPerson';
import Markdown from '../../components/Markdown';

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
};

const orgQuery = gql`
  ${GameCard.fragments.game}
  ${EventCard.fragments.event}

  query org($id: UUID!) {
    entity(id: $id) {
      id
      name
      type
      site
      about

      location {
        id
        street
        city
        region
        countryCode
        latitude
        longitude
      }

      logo {
        id
        thumbnail_url
      }

      people {
        totalCount
      }

      games {
        totalCount
        nodes {
          id
          ...GameCardGame
        }
      }

      events {
        totalCount
        nodes {
          id
          ...EventCardEvent
        }
      }
    }
  }
`;

const deleteOrgMutation = gql`
  mutation deleteOrg($id: UUID!) {
    deleteEntity(input: { id: $id }) {
      org: entity {
        id
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

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

const Org = ({ id, host }) => {
  const placeholder = usePlaceholder('square');
  const currentPerson = useCurrentPerson();
  const router = useRouter();
  const validId = uuidRegex.test(id);
  const toast = useToast();

  const { cache } = useApolloClient();
  const { loading, error, data } = useQuery(orgQuery, {
    variables: { id },
    skip: !validId,
  });

  const [deleteOrg, { loading: isBeingDeleted }] = useMutation(
    deleteOrgMutation,
    {
      variables: { id },
      skip: !validId,
    }
  );

  const deleteModal = useDisclosure();

  if (
    error ||
    (id === undefined || id !== undefined && !validId) ||
    (!loading && data.entity === null)
  ) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const {
    name,
    type,
    site,
    about,
    location,
    logo,
    games,
    events,
  } = data.entity;

  return (
    <div>
      <Head>
        <title>{name} - Organizations</title>

        <meta property="og:title" content={name} />
        <meta property="og:description" content={`${about}.`} />
        <meta property="og:url" content={`https://${host}/org/${id}`} />
        {logo && <meta property="og:image" content={logo.thumbnail_url} />}

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content={name} />
        <meta name="twitter:description" content={`${about}.`} />
        {logo && <meta name="twitter:image" content={logo.thumbnail_url} />}
      </Head>

      <Navigation />

      <Box mt={[5, 2, 5]} padding={[0, 5]}>
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

          <Box isTruncated flex="1" ml={2}>
            <Heading>{name}</Heading>
            <DarkMode>
              <Badge
                rounded={3}
                variant="solid"
                colorScheme={TYPES_COLORS[type]}
              >
                {type}
              </Badge>
            </DarkMode>
            {site && (
              <ChakraLink href={site} isExternal ml={2}>
                {site.replace(/https?:\/\//, '')}
                <ExternalLinkIcon mx="2px" />
              </ChakraLink>
            )}
            {location && (
              <Text>
                {location.city}, {location.region}, {location.countryCode}
              </Text>
            )}
          </Box>
        </Flex>

        {currentPerson && (
          <Link href={`/org/${id}/edit`}>
            <Button leftIcon={<EditIcon />} colorScheme="teal" mt={3}>
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

      {games.nodes.length > 0 && (
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
              {games.nodes.length}
            </Badge>
          </Heading>

          <motion.div
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
              {games.nodes.map((game) => (
                <Box minW={0} key={game.id}>
                  <motion.div variants={variants}>
                    <GameCard {...game} />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}

      {events.nodes.length > 0 && (
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
              {events.nodes.length}
            </Badge>
          </Heading>

          <motion.div
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
              {events.nodes.map((event) => (
                <Box minW={0} key={event.id}>
                  <motion.div variants={variants}>
                    <EventCard {...event} />
                  </motion.div>
                </Box>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}

      {currentPerson && (
        <Box mb={5} pl={5} pr={5}>
          <Button variant="link" colorScheme="red" onClick={deleteModal.onOpen}>
            Delete organization
          </Button>

          <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Organisation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Do you really want to delete {name}?</Text>
              </ModalBody>

              <ModalFooter>
                <Button
                  isLoading={isBeingDeleted}
                  loadingText="Deleting"
                  colorScheme="red"
                  mr={3}
                  onClick={async () => {
                    await deleteOrg();

                    deleteModal.onClose();
                    router.replace('/orgs');

                    cache.evict({ id });

                    toast({
                      title: 'Organization deleted.',
                      description: `${name} has been deleted.`,
                      status: 'success',
                    });
                  }}
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
    </div>
  );
};

Org.getInitialProps = async (context) => {
  const { id } = context.query;

  if (context.req) {
    return {
      id,
      host: context.req.headers.host,
    };
  }

  return {
    id,
    host: window.location.hostname,
  };
};

export default withApollo({ ssr: true })(Org);
