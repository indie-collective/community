import { Box, Heading, Stack } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import GameForm from '../../components/GameForm';

const createGameMutation = gql`
  mutation createEvent(
    $name: String!
    $about: String
    $site: String
  ) {
    createGame(
      input: {
        game: {
          name: $name
          about: $about
          site: $site
        }
      }
    ) {
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

  // const [uploadImage, { loading: loadingImage }] = useMutation(
  //   gql(uploadImageMutation)
  // );
  const [createGame, { loading }] = useMutation(createGameMutation);

  async function handleFormSubmit({
    name,
    about,
    site,
  }) {
    const response = await createGame({
      variables: {
        name,
        about,
        site,
      },
    });

    push(`/game/${response.data.createGame.game.id}`);
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
            loading={loading}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateGame);
