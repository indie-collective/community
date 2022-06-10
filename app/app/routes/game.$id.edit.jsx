import { Box, Heading, useToast } from '@chakra-ui/react';
// import differenceWith from 'lodash.differencewith';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, useTransition } from '@remix-run/react';

import { db } from '../utils/db.server';
import Navigation from '../components/Navigation';
import GameForm from '../components/GameForm';
import { useEffect } from 'react';

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ params }) => {
  const { id } = params;

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const game = await db.game.findUnique({
    where: { id },
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
    },
  });

  const data = {
    game,
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
    },
  };

  return json(data);
};

export async function action({ request, params }) {
  const { id } = params;

  const data = await request.formData();

  try {
    const [, igdb_slug] =
      (data.get('igdb_url') || '').match(/games\/(.+)/) || [];

    const game = await db.game.update({
      where: { id },
      data: {
        name: data.get('name'),
        about: data.get('about'),
        site: data.get('site'),
        igdb_slug,
      },
      select: {
        id: true,
      },
    });

    return redirect(`/game/${game.id}`);
  } catch (err) {
    console.log(err);

    const values = Object.fromEntries(data);
    return json({ error: 'Updating the game failed', values });
  }
}

export const meta = ({ data }) => ({
  title: `Edit "${data.game.name}" | Games`,
});

const EditGame = () => {
  const { game } = useLoaderData();
  const toast = useToast();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    toast({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
      position: 'bottom-right',
    });
  }, [actionData?.error, transition.state === 'submitting', toast]);

  return (
    <div>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Update game</Heading>

        <GameForm
          method="post"
          defaultData={{
            id: game.id,
            name: game.name,
            igdb_url:
              game.igdb_slug ? 'https://www.igdb.com/games/' +
              game.igdb_slug : '',
            about: game.about,
            site: game.site,
            tags: game.game_tag.map(({ tag }) => tag),
          }}
          loading={false}
        />
      </Box>
    </div>
  );
};

export default EditGame;