import { useCallback, useState } from 'react';
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client';
import {
  Spinner,
  Box,
  Heading,
  Text,
  Image,
  Grid,
  Icon,
  useColorMode,
  PseudoBox,
  AspectRatioBox,
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
} from '@chakra-ui/core';
import Error from 'next/error';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';

import { withApollo } from '../../lib/apollo';
import useCurrentPerson from '../../hooks/useCurrentPerson';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import OrgCard from '../../components/OrgCard';
import SearchOrgModal from '../../components/SearchOrgModal';

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

const Game = ({ id }) => {
  const validId = uuidRegex.test(id);

  const currentPerson = useCurrentPerson();
  const {
    isOpen: linkAuthorIsOpen,
    onOpen: onOpenLinkAuthor,
    onClose: onCloseLinkAuthor,
  } = useDisclosure();
  const { colorMode } = useColorMode();
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
    (id !== undefined && !validId) ||
    (!loading && data.game === null)
  ) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const { name, site, about, images, entities } = data.game;

  return (
    <div>
      <Head>
        <title>{name} - Games</title>
      </Head>

      <Navigation />

      <Box mb={5} pl={5} pr={5}>
        <Heading>{name}</Heading>
        <Text fontSize="lg">
          <a href={site}>{site}</a>
        </Text>

        {currentPerson && (
          <Link href={`/game/${id}/edit`}>
            <Button leftIcon="edit" variantColor="teal" mt={3}>
              Edit
            </Button>
          </Link>
        )}

        <Text fontSize="md" mt={3}>
          {about}
        </Text>
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
                variantColor="teal"
                aria-label="Add an author to the game"
                icon="add"
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
            <AspectRatioBox key={id} ratio={1}>
              <Image objectFit="cover" size="100%" src={thumbnail_url} alt="" />
            </AspectRatioBox>
          ))}
          {currentPerson && (
            <AspectRatioBox key={id} ratio={1}>
              <PseudoBox
                transition="background-color 200ms ease-out"
                color={
                  isDragActive
                    ? colorMode === 'dark'
                      ? 'teal.700'
                      : 'teal.100'
                    : colorMode === 'dark'
                    ? 'gray.700'
                    : 'gray.200'
                }
                _hover={
                  isDragActive
                    ? {
                        color: colorMode === 'dark' ? 'teal.50' : 'teal.600',
                        borderColor:
                          colorMode === 'dark' ? 'teal.700' : 'teal.600',
                        cursor: 'pointer',
                      }
                    : {
                        color: colorMode === 'dark' ? 'gray.50' : 'gray.400',
                        backgroundColor:
                          colorMode === 'dark' ? 'gray.700' : 'gray.100',
                        cursor: 'pointer',
                      }
                }
                rounded={5}
                borderWidth={5}
                padding={5}
                borderStyle="dashed"
                borderColor={
                  isDragActive
                    ? colorMode === 'dark'
                      ? 'teal.700'
                      : 'teal.100'
                    : colorMode === 'dark'
                    ? 'gray.700'
                    : 'gray.100'
                }
                textAlign="center"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                {isLoadingNewImages ? (
                  <Spinner />
                ) : (
                  <Icon name="add" size="48px" />
                )}
              </PseudoBox>
            </AspectRatioBox>
          )}
        </Grid>
      </Box>

      {currentPerson && (
        <Box mb={5} pl={5} pr={5}>
          <Button
            variant="link"
            variantColor="red"
            onClick={deleteModal.onOpen}
          >
            Delete game
          </Button>

          <Modal
            preserveScrollBarGap
            isOpen={deleteModal.isOpen}
            onClose={deleteModal.onClose}
          >
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
                  variantColor="red"
                  mr={3}
                  onClick={async () => {
                    await deleteGame();

                    deleteModal.onClose();
                    router.replace('/games');

                    cache.evict({ id });
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

  return {
    id,
  };
};

export default withApollo({ ssr: true })(Game);
