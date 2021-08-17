import { useCallback, useState } from 'react';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
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
  useToast,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';

import Error from '../_error';
import { withApollo } from '../../lib/apollo';
import useCurrentPerson from '../../hooks/useCurrentPerson';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import OrgCard from '../../components/OrgCard';
import SearchOrgModal from '../../components/SearchOrgModal';
import Markdown from '../../components/Markdown';

const gameQuery = gql`
  ${OrgCard.fragments.org}

  query game($id: UUID!) {
    game(id: $id) {
      id
      name
      about
      site

      images {
        nodes {
          id
          url
          thumbnail_url
        }
      }

      entities {
        totalCount
        nodes {
          id
          ...OrgCardOrg
        }
      }

      tags {
        totalCount
        nodes {
          name
        }
      }

      events {
        totalCount
        nodes {
          name
        }
      }
    }
  }
`;

const addGameImageMutation = gql`
  mutation addGameImage($gameId: UUID!, $imageId: UUID!) {
    createGameImage(
      input: { gameImage: { gameId: $gameId, imageId: $imageId } }
    ) {
      image {
        id
        url
        thumbnail_url
      }
    }
  }
`;

const deleteGameMutation = gql`
  mutation deleteGame($id: UUID!) {
    deleteGame(input: { id: $id }) {
      game {
        id
      }
    }
  }
`;

const addAuthorToGameMutation = gql`
  ${OrgCard.fragments.org}

  mutation addAuthorToGame($gameId: UUID!, $authorId: UUID!) {
    createGameEntity(
      input: { gameEntity: { gameId: $gameId, entityId: $authorId } }
    ) {
      entity {
        id
        ...OrgCardOrg
      }
    }
  }
`;

const removeAuthorFromGameMutation = gql`
  mutation removeAuthorFromGame($gameId: UUID!, $authorId: UUID!) {
    deleteGameEntity(input: { gameId: $gameId, entityId: $authorId }) {
      entity {
        id
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Game = ({ id, host }) => {
  const validId = uuidRegex.test(id);
  const toast = useToast();

  const dzColor = useColorModeValue('gray.200', 'gray.700');
  const dzHoverColor = useColorModeValue('gray.400', 'gray.50');
  const dzActiveColor = useColorModeValue('teal.200', 'teal.700');
  const dzActiveHoverColor = useColorModeValue('teal.600', 'teal.50');

  const dzBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveBorderColor = useColorModeValue('teal.200', 'teal.700');
  const dzHoverBorderColor = useColorModeValue('gray.200', 'gray.700');
  const dzActiveHoverBorderColor = useColorModeValue('teal.600', 'teal.700');

  const currentPerson = useCurrentPerson();
  const {
    isOpen: linkAuthorIsOpen,
    onOpen: onOpenLinkAuthor,
    onClose: onCloseLinkAuthor,
  } = useDisclosure();
  const router = useRouter();
  const [isLoadingNewImages, setIsLoadingNewImages] = useState(false);

  const { cache } = useApolloClient();
  const { loading, error, data, refetch } = useQuery(gameQuery, {
    variables: { id },
    skip: !validId,
  });
  const [uploadImage] = useMutation(gql(uploadImageMutation));
  const [addGameImage] = useMutation(addGameImageMutation, {
    skip: !validId,
    update(cache, { data: { createGameImage } }) {
      cache.modify({
        id: cache.identify(data.game),
        fields: {
          images(imagesRef) {
            const newImageRef = cache.writeFragment({
              fragment: gql`
                fragment GameImage on Image {
                  id
                  url
                  thumbnail_url
                }
              `,
              data: createGameImage.image,
            });

            return {
              ...imagesRef,
              nodes: [...imagesRef.nodes, newImageRef],
              totalCount: imagesRef.totalCount + 1,
            };
          },
        },
      });
    },
  });
  const [deleteGame, { loading: isBeingDeleted }] = useMutation(
    deleteGameMutation,
    {
      variables: { id },
      skip: !validId,
    }
  );
  const [addAuthorToGame] = useMutation(addAuthorToGameMutation, {
    update(cache, { data: { createGameEntity } }) {
      refetch();
      // still no clue
      // cache.modify({
      //   id: cache.identify(data.game),
      //   fields: {
      //     entities(orgsRef) {
      //       const newOrgRef = cache.writeFragment({
      //         fragment: OrgCard.fragments.org,
      //         data: createGameEntity.entity,
      //       });

      //       return {
      //         ...orgsRef,
      //         nodes: [...orgsRef.nodes, newOrgRef],
      //         totalCount: orgsRef.totalCount + 1,
      //       };
      //     },
      //   },
      // });
    },
  });
  const [removeAuthorFromGame] = useMutation(removeAuthorFromGameMutation, {
    update(cache, { data: { deleteGameEntity } }) {
      cache.modify({
        id: cache.identify(data.game),
        fields: {
          entities(orgsRef, { readField }) {
            const newNodesList = orgsRef.nodes.filter(
              (nodeRef) =>
                deleteGameEntity.entity.id !== readField('id', nodeRef)
            );

            return {
              ...orgsRef,
              totalCount: newNodesList.length,
              nodes: newNodesList,
            };
          },
        },
      });
    },
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    setIsLoadingNewImages(true);

    await Promise.all(
      acceptedFiles.map(async (file) => {
        const response = await uploadImage({
          variables: {
            file,
          },
        });

        await addGameImage({
          variables: {
            gameId: id,
            imageId: response.data.createImage.image.id,
          },
        });
      })
    );

    setIsLoadingNewImages(false);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const deleteModal = useDisclosure();

  if (
    error ||
    id === undefined ||
    (id !== undefined && !validId) ||
    (!loading && data.game === null)
  ) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const { name, site, about, images, entities, tags } = data.game;

  return (
    <div>
      <Head>
        <title>{name} - Games</title>

        <meta property="og:title" content={name} />
        <meta property="og:description" content={`${about}.`} />
        <meta property="og:url" content={`https://${host}/game/${id}`} />
        {images.nodes[0] && (
          <meta property="og:image" content={images.nodes[0].thumbnail_url} />
        )}

        <meta
          name="twitter:card"
          content={images.nodes[0] ? 'summary_large_image' : 'summary'}
        />
        <meta name="twitter:site" content="@IndieColle" />
        <meta name="twitter:title" content={name} />
        <meta name="twitter:description" content={`${about}.`} />
        {images.nodes[0] && (
          <meta name="twitter:image" content={images.nodes[0].thumbnail_url} />
        )}
      </Head>

      <Navigation />

      <Box mb={5} pl={5} pr={5}>
        <Heading>{name}</Heading>
        {site && (
          <Text fontSize="lg">
            <ChakraLink href={site} isExternal>
              {site.replace(/https?:\/\//, '')}
              <ExternalLinkIcon mx="2px" />
            </ChakraLink>
          </Text>
        )}

        {currentPerson && (
          <Link href={`/game/${id}/edit`}>
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
        {tags.nodes.map((tag) => (
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
          {entities.nodes.map((author) => (
            <OrgCard
              key={author.id}
              {...author}
              onRemove={
                currentPerson
                  ? () =>
                      removeAuthorFromGame({
                        variables: { gameId: id, authorId: author.id },
                        optimisticResponse: {
                          __typename: 'Mutation',
                          deleteGameEntity: {
                            __typename: 'DeleteGameEntityMutation',
                            entity: { __typename: 'Entity', ...author },
                          },
                        },
                      })
                  : null
              }
            />
          ))}
          {currentPerson && (
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
                excludedIds={entities.nodes.map(({ id }) => id)}
                onSelect={(author) =>
                  addAuthorToGame({
                    variables: { gameId: id, authorId: author.id },
                    optimisticResponse: {
                      __typename: 'Mutation',
                      createGameEntity: {
                        __typename: 'CreateGameEntityMutation',
                        entity: { __typename: 'Entity', ...author },
                      },
                    },
                  })
                }
              />
            </>
          )}
        </Grid>
      </Box>

      <Box mb={5} pl={5} pr={5}>
        <Heading size="md" mb={2}>
          Images
        </Heading>
        <Grid
          gap={3}
          templateColumns={[
            'repeat(3, 1fr)',
            'repeat(4, 1fr)',
            'repeat(5, 1fr)',
            'repeat(6, 1fr)',
          ]}
        >
          {images.nodes.map(({ id, thumbnail_url }) => (
            <AspectRatio key={id} ratio={1}>
              <Image objectFit="cover" size="100%" src={thumbnail_url} alt="" />
            </AspectRatio>
          ))}
          {currentPerson && (
            <AspectRatio key={id} ratio={1}>
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
                {isLoadingNewImages ? <Spinner /> : <AddIcon size="48px" />}
              </Box>
            </AspectRatio>
          )}
        </Grid>
      </Box>

      {currentPerson && (
        <Box mb={5} pl={5} pr={5}>
          <Button variant="link" colorScheme="red" onClick={deleteModal.onOpen}>
            Delete game
          </Button>

          <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Game</ModalHeader>
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
                    await deleteGame();

                    deleteModal.onClose();
                    router.replace('/games');

                    cache.evict({ id });

                    toast({
                      title: 'Game deleted.',
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

Game.getInitialProps = async (context) => {
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

export default withApollo({ ssr: true })(Game);
