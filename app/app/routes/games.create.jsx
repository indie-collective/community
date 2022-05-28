import { Box, Heading, useToast } from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import Navigation from '../components/Navigation';
import GameForm from '../components/GameForm';

export async function action({ request }) {
  const data = await request.formData();

  try {
    const game = await db.game.create({
      data: {
        name: data.get('name'),
        about: data.get('about'),
        site: data.get('site'),
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      data
        .get('tags')
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .map((tag) =>
          db.tag.upsert({
            where: {
              name: tag,
            },
            create: {
              name: tag,
              game_tag: {
                create: {
                  game_id: game.id,
                },
              },
            },
            update: {
              game_tag: {
                create: {
                  game_id: game.id,
                },
              },
            },
          })
        )
    );

    return redirect(`/game/${game.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
}

export const meta = () => ({
  title: 'Add a game',
});

const CreateGame = () => {
  const toast = useToast();
  const transition = useTransition();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    toast({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
  }, [actionData?.error, transition.state === 'submitting', toast]);

  return (
    <div>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Create game</Heading>

        <GameForm
          method="POST"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values}
        />
      </Box>
    </div>
  );
};

export default CreateGame;
