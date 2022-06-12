import {
  Spinner,
  Box,
  Stack,
  Heading,
  Text,
  Image,
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
  useColorModeValue,
  Link as ChakraLink,
  List,
  ListItem,
} from '@chakra-ui/react';
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { json } from '@remix-run/node';
import { Form, Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { db } from '../utils/db.server';
import { getIGDBGame } from '../utils/igdb.server';
import getImageLinks from '../utils/imageLinks.server';
import Navigation from '../components/Navigation';
import OrgCard from '../components/OrgCard';
import SearchOrgModal from './search-org';
import Markdown from '../components/Markdown';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ params }) => {
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
            }
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

  if (game.igdb_slug) {
    const igdbGame = await getIGDBGame(game.igdb_slug);

    game.igdb_game = igdbGame;
  }

  const data = {
    game: {
      ...game,
      game_image: game.game_image.map((gameImage) => ({
        ...gameImage,
        image: getImageLinks(gameImage.image),
      })),
      game_entity: game.game_entity.map((gameEntity) => ({
        ...gameEntity,
        entity: {
          ...gameEntity.entity,
          logo: gameEntity.entity.logo ? getImageLinks(gameEntity.entity.logo) : undefined,
        },
      })),
    },
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
  };

  return json(data);
};

export const meta = ({ data: { game }, location }) => ({
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
});

const Game = () => {
  const { game, currentUser } = useLoaderData();
  const fetcher = useFetcher();

  const dzColor = useColorModeValue('gray.200', 'gray.700');
  const dzHoverColor = useColorModeValue('gray.400', 'gray.50');
  const dzActiveColor = useColorModeValue('teal.200', 'teal.700');
  const dzActiveHoverColor = useColorModeValue('teal.600', 'teal.50');

  const dzBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveBorderColor = useColorModeValue('teal.200', 'teal.700');
  const dzHoverBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveHoverBorderColor = useColorModeValue('teal.600', 'teal.700');

  const {
    isOpen: linkAuthorIsOpen,
    onOpen: onOpenLinkAuthor,
    onClose: onCloseLinkAuthor,
  } = useDisclosure();

  const onDrop = useCallback(async (acceptedFiles) => {
    const form = new FormData();

    for (const file of acceptedFiles) {
      form.append('images', file);
    }

    await fetcher.submit(
      form,
      {
        method: 'post',
        action: `/game/${id}/images/add`,
        encType: 'multipart/form-data',
      }
      // { method: 'post', action: './images/add' }
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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

  return (
    <div>
      <Navigation />

      <Box mb={5} pl={5} pr={5} mt={5}>
        <Heading>{name}</Heading>
        {site && (
          <Text fontSize="lg">
            <ChakraLink href={site} isExternal>
              {site.replace(/https?:\/\//, '')}
              <ExternalLinkIcon mx="2px" />
            </ChakraLink>
          </Text>
        )}

        {currentUser && (
          <Link to={`/game/${id}/edit`}>
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

      <Stack isInline spacing={2} mb={5} pl={5} pr={5}>
        {tags.map((tag) => (
          <Tag colorScheme="teal">{tag.name}</Tag>
        ))}
      </Stack>

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
        <Heading size="md" mb={2}>
          Images
        </Heading>
        <Grid
          gap={3}
          templateColumns={[
            'repeat(1, 1fr)',
            'repeat(2, 1fr)',
            'repeat(3, 1fr)',
          ]}
        >
          {igdb_game?.screenshots.map((image) => (
            <AspectRatio key={id} ratio={16 / 9}>
              <Image
                objectFit="cover"
                size="100%"
                src={image.url.replace('t_thumb', 't_screenshot_med')}
                alt=""
              />
            </AspectRatio>
          ))}
          {images.map((image) => (
            <Box key={image.id} position="relative">
              <AspectRatio ratio={16 / 9}>
                <Image
                  objectFit="cover"
                  size="100%"
                  src={image.thumbnail_url}
                  alt=""
                />
              </AspectRatio>
              {currentUser && (
                <IconButton
                  position="absolute"
                  bottom={2}
                  right={2}
                  size="xs"
                  aria-label={`Remove image ${id}`}
                  isRound
                  colorScheme="red"
                  icon={<DeleteIcon />}
                  onClick={(e) => {
                    e.preventDefault();

                    fetcher.submit(
                      { id: image.id },
                      { method: 'post', action: `/game/${id}/images/delete` }
                      // { method: 'post', action: './images/delete' }
                    );
                  }}
                />
              )}
            </Box>
          ))}
          {fetcher.state === 'submitting' &&
            fetcher.submission.action.includes('images/add') &&
            fetcher.submission.formData.getAll('images').map((file) => (
              <Box key={file.name} position="relative">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    objectFit="cover"
                    size="100%"
                    src={URL.createObjectURL(file)}
                    alt=""
                    opacity={0.5}
                  />
                </AspectRatio>
                <Spinner position="absolute" inset={0} margin="auto" size="lg" />
              </Box>
            ))}
          {currentUser && (
            <AspectRatio key={id} ratio={16 / 9}>
              <Box
                transition="background-color 200ms ease-out"
                color={isDragActive ? dzActiveColor : dzColor}
                borderColor={isDragActive ? dzActiveBorderColor : dzBorderColor}
                _hover={
                  isDragActive
                    ? {
                        color: dzActiveHoverColor,
                        borderColor: dzActiveHoverBorderColor,
                        cursor: 'pointer',
                      }
                    : {
                        color: dzHoverColor,
                        backgroundColor: dzHoverBorderColor,
                        cursor: 'pointer',
                      }
                }
                rounded={5}
                borderWidth={5}
                padding={5}
                borderStyle="dashed"
                textAlign="center"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <AddIcon size="48px" />
              </Box>
            </AspectRatio>
          )}
        </Grid>
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
                <iframe
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
            <ModalContent as={Form} action={`./delete`} method="post">
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
    </div>
  );
};

export default Game;
