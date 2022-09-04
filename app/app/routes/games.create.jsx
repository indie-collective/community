import { Box, Heading, useToast } from '@chakra-ui/react';
import { json, redirect } from '@remix-run/node';
import { useActionData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import GameForm from '../components/GameForm';

export async function action({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin?redirect=/games/create',
  });

  const data = await request.formData();

  try {
    const tagsList =
      data
        .get('tags')
        ?.split(',')
        .map((t) => t.trim().toLowerCase()) || [];

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
        game_tag: {
          createMany: {
            data: tags.map((tag) => ({
              tag_id: tag.id,
            })),
            skipDuplicates: true,
          },
          deleteMany: {
            tag_id: {
              notIn: tags.map((t) => t.id),
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return redirect(`/game/${game.id}`);
  } catch (err) {
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
}

export const loader = async ({ request }) => {
  const { pathname, search, searchParams } = new URL(request.url);

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: `/signin?redirect=${pathname}?${search}`,
  });

  return json({
    values: {
      name: searchParams.get('name') || '',
    },
    currentUser,
  });
};

export const meta = () => ({
  title: 'Add a game',
});

const CreateGame = () => {
  const toast = useToast();
  const transition = useTransition();
  const loaderData = useLoaderData();
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
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Create game</Heading>

      <GameForm
        method="POST"
        loading={transition.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateGame;
