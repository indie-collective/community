import { Box, Heading } from '@chakra-ui/react';
import { redirect, useActionData, useLoaderData, useNavigation  } from 'react-router';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { toaster } from '../components/ui/toaster';
import GameForm from '../components/GameForm';

export async function action(args) {
  const { request } = args;
  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  const tagsList =
    data
      .get('tags')
      ?.split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean) || [];

  try {
    const [, igdb_slug = null] =
      (data.get('igdb_url') || '').match(/games\/(.+)/) || [];

    const tags = await db.$transaction(
      tagsList.map((tag) =>
        db.tag.upsert({
          where: {
            name: tag,
          },
          create: {
            name: tag,
          },
          update: {},
        })
      )
    );

    const game = await db.game.create({
      data: {
        name: data.get('name'),
        about: data.get('about'),
        site: data.get('site'),
        igdb_slug,
        lastModifiedById: currentUser.id,
        game_tag: {
          createMany: {
            data: tags.map((tag) => ({
              tag_id: tag.id,
            })),
          },
        },
      },
      select: {
        id: true,
      },
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
  const { pathname, search, searchParams } = new URL(request.url);

  const currentUser = await isAuthenticated(request, {
    failureRedirect: `/signin?redirect=${pathname}?${search}`,
  });

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

    toaster.create({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
  }, [actionData?.error, navigation.state === 'submitting', toast]);

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
