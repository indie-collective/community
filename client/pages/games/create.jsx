import { Box, Heading } from '@chakra-ui/react';
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

  async function handleFormSubmit({ name, about, site, tags: tagsStr }) {
    const response = await createGame({
      variables: {
        name,
        about,
        site,
      },
    });

    const { game } = response.data.createGame;

    const tags = tagsStr.trim()
      ? tagsStr
          .trim()
          .split(',')
          .map((t) => t.trim().toLowerCase())
      : [];

    await Promise.all(
      tags
        .map(async (tagName) => {
          const result = await addOrGetTag({
            variables: { name: tagName },
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

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Create game</Heading>

        <GameForm
          onSubmit={handleFormSubmit}
          loading={loading || loadingTag || loadingTagLink}
        />
      </Box>
    </div>
  );
};

export default withApollo()(CreateGame);
