import { Box, Heading, Spinner, Stack } from '@chakra-ui/core';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
import differenceWith from 'lodash.differencewith';

import Error from '../../_error';
import { withApollo } from '../../../lib/apollo';
import Navigation from '../../../components/Navigation';
import GameForm from '../../../components/GameForm';

const getGameQuery = gql`
  query getGame($id: UUID!) {
    game(id: $id) {
      id
      name
      about
      site
      tags {
        nodes {
          id
          name
        }
      }
    }
  }
`;

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

const unlinkTagFromGameMutation = gql`
  mutation unlinkTagFromGame($gameId: UUID!, $tagId: UUID!) {
    deleteGameTag(input: { gameId: $gameId, tagId: $tagId }) {
      gameTag {
        tagId
        gameId
      }
    }
  }
`;

const updateGameMutation = gql`
  mutation updateGame(
    $id: UUID!
    $name: String
    $about: String
    $site: String
  ) {
    updateGame(
      input: { id: $id, patch: { name: $name, about: $about, site: $site } }
    ) {
      game {
        id
        name
        about
        site
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const EditGame = ({ id }) => {
  const validId = uuidRegex.test(id);
  const { push } = useRouter();

  const { loading, error, data } = useQuery(getGameQuery, {
    variables: { id },
    skip: !validId,
  });
  const [updateGame, { loadingUpdate }] = useMutation(updateGameMutation);
  const [addOrGetTag, { loadingTag }] = useMutation(addOrGetTagMutation);
  const [linkTagToGame, { loadingTagLink }] = useMutation(
    linkTagToGameMutation
  );
  const [unlinkTagFromGame, { loadingTagUnlink }] = useMutation(
    unlinkTagFromGameMutation
  );

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  async function handleFormSubmit({ name, about, site, tags: tagsStr }) {
    const response = await updateGame({
      variables: {
        id,
        name,
        about,
        site,
      },
    });

    const { game } = response.data.updateGame;

    const tags = tagsStr
      .trim()
      .split(',')
      .map((t) => t.trim().toLowerCase());

    const tagsToDelete = differenceWith(
      data.game.tags.nodes,
      tags,
      (existingTag, tag) => tag === existingTag.name.toLowerCase()
    );

    await Promise.all(
      tagsToDelete.map((tag) =>
        unlinkTagFromGame({
          variables: { gameId: game.id, tagId: tag.id },
        })
      )
    );

    const tagsToAdd = differenceWith(
      tags,
      data.game.tags.nodes,
      (tag, existingTag) => tag === existingTag.name.toLowerCase()
    );

    await Promise.all(
      tagsToAdd.map(async (tagName) => {
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
        <title>Update game</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Update game</Heading>

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <GameForm
            defaultData={data && data.game}
            onSubmit={handleFormSubmit}
            loading={
              loadingUpdate || loadingTag || loadingTagLink || loadingTagUnlink
            }
          />
        </Stack>
      </Box>
    </div>
  );
};

EditGame.getInitialProps = async (context) => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(EditGame);
