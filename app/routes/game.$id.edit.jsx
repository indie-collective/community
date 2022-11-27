import { Box, Heading, useToast } from '@chakra-ui/react';
// import differenceWith from 'lodash.differencewith';
import { json, redirect } from '@remix-run/node';
import { useActionData, useLoaderData, useTransition } from '@remix-run/react';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import computeGame from '../models/game';
import GameForm from '../components/GameForm';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const { id } = params;

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: `/signin?redirect=/games/${id}/edit`,
  });

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

  return json({
    game: await computeGame(game),
    currentUser,
  });
};

export async function action({ request, params }) {
  const { id } = params;

  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: `/signin?redirect=/games/${id}/edit`,
  });

  const data = await request.formData();

  try {
    const [, igdb_slug = null] =
      (data.get('igdb_url') || '').match(/games\/(.+)/) || [];

    const tagsList =
      data
        .get('tags')
        ?.split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean) || [];

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

    const [, game] = await db.$transaction([
      db.$executeRawUnsafe(
        `SET LOCAL indieco.current_user_id = '${currentUser.id}';`
      ),
      db.game.update({
        where: { id },
        data: {
          name: data.get('name'),
          about: data.get('about'),
          site: data.get('site'),
          igdb_slug,
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
      }),
    ]);

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
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Update game</Heading>

      <GameForm
        method="post"
        defaultData={{
          id: game.id,
          name: game.name,
          igdb_url: game.igdb_slug
            ? 'https://www.igdb.com/games/' + game.igdb_slug
            : '',
          about: game.about,
          site: game.site,
          tags: game.game_tag.map(({ tag }) => tag),
        }}
        loading={transition.state === 'submitting'}
      />
    </Box>
  );
};

export default EditGame;
