import { Box, Heading, Spinner, Stack } from '@chakra-ui/core';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

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
      input: {
        id: $id
        patch: { name: $name, about: $about, site: $site }
      }
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

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  async function handleFormSubmit({ name, about, site }) {
    const response = await updateGame({
      variables: {
        id,
        name,
        about,
        site,
      },
    });

    push(`/game/${response.data.updateGame.game.id}`);
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
            loading={loadingUpdate}
          />
        </Stack>
      </Box>
    </div>
  );
};

EditGame.getInitialProps = async context => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(EditGame);
