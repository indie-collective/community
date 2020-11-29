import { Box, Heading, Stack } from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import GameForm from '../../components/GameForm';

const addOrGetTagMutation = gql`
  mutation addOrGetTag($name: String!) {
    upsertTagByName(input: { tag: { name: $name }, patch: { name: $name } }) {
      tag {
        id
      }
    }
  }
`;

const linkTagToGameMutation = gql`
  mutation linkTagToGame($gameId: UUID!, $tagId: UUID!) {
    upsertGameTagByGameIdAndTagId(
      input: {
        gameTag: { gameId: $gameId, tagId: $tagId }
        patch: { gameId: $gameId, tagId: $tagId }
      }
    ) {
      gameTag {
        tagId
        gameId
      }
    }
  }
`;

const createGameMutation = gql`
  mutation createEvent($name: String!, $about: String, $site: String) {
    createGame(input: { game: { name: $name, about: $about, site: $site } }) {
      game {
        id
        name
        about
        site

        images {
          totalCount
          nodes {
            url
            thumbnail_url
          }
        }

        entities {
          totalCount
          nodes {
            id
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
            id
          }
        }
      }
    }
  }
`;

const CreateGame = () => {
  const { push } = useRouter();

  const [createGame, { loading }] = useMutation(createGameMutation);
  const [addOrGetTag, { loadingTag }] = useMutation(addOrGetTagMutation);
  const [linkTagToGame, { loadingTagLink }] = useMutation(
    linkTagToGameMutation
  );

  async function handleFormSubmit({ name, about, site, tags }) {
    const response = await createGame({
      variables: {
        name,
        about,
        site,
      },
    });

    const { game } = response.data.createGame;

    await Promise.all(
      tags
        .trim()
        .split(',')
        .map(async (tagName) => {
          const result = await addOrGetTag({
            variables: { name: tagName.trim() },
          });
          const { tag } = result.data.upsertTagByName;

          await linkTagToGame({
            variables: { gameId: game.id, tagId: tag.id },
          });
        })
    );

    push(`/game/${game.id}`);
  }

  return (
    <div>
      <Head>
        <title>Create a new game</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Create game</Heading>

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <GameForm
            onSubmit={handleFormSubmit}
            loading={loading || loadingTag || loadingTagLink}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateGame);
