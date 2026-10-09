import { Box, Heading } from '@chakra-ui/react';
import { redirect, useActionData, useLoaderData, useNavigation  } from 'react-router';
import { useEffect } from 'react';

import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { toaster } from '../components/ui/toaster';
import GameForm from '../components/GameForm';
import { createGame, resolveGameTags } from '../data/games.server';

export async function action(args) {
  const { request } = args;
  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  const tagsList = await resolveGameTags(data.get('tags'));

  try {
    const [, igdb_slug = null] =
      (data.get('igdb_url') || '').match(/games\/(.+)/) || [];

    const game = await createGame({
      name: data.get('name'),
      about: data.get('about'),
      site: data.get('site'),
      igdbSlug: igdb_slug,
      tagNames: tagsList,
      authorId: currentUser.id,
    });

    const port = process.env.PORT ?? 3000;
    const BASE_URL = process.env.BASE_URL ?? `http://localhost:${port}`;

    await notifyDiscord(
      `${currentUser.username} added game "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}/game/${game.id}`
    );

    return redirect(`/game/${game.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    values.tags = tagsList.map((t) => ({ name: t }));
    return { error: err.message, values };
  }
}

export const loader = async ({ request }) => {
  const { searchParams } = new URL(request.url);

  const currentUser = await isAuthenticated(request, true);

  return {
    values: {
      name: searchParams.get('name') || '',
    },
    currentUser,
  };
};

export const meta = () => [{
  title: 'Add a game'
}];

const CreateGame = () => {
    const navigation = useNavigation();
  const loaderData = useLoaderData();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    // Deferred: creating a toast while React commits triggers flushSync.
    queueMicrotask(() =>
      toaster.create({
        title: 'Something went wrong',
        description: actionData?.error,
        type: 'error',
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Add Game</Heading>

      <GameForm
        method="POST"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateGame;
