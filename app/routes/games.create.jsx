import { Box } from '@chakra-ui/react';
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { actionErrorMessage } from '../utils/actionError.server';
import { useEffect } from 'react';

import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { notifyDiscord } from '../utils/discordNotification.server';
import { toaster } from '../components/ui/toaster';
import GameForm from '../components/GameForm';
import { createGame, resolveGameTags } from '../data/games.server';
import getOrigin from '../utils/origin.server';
import { gamePath } from '../utils/slug';
import { announceOnBluesky } from '../utils/blueskyPost.server';
import { afterResponse } from '../utils/igdbData.server';
import { summarize } from '../utils/meta';
import { PageHeader } from '../components/Page';

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

    const BASE_URL = getOrigin(request);

    // #160: and on Bluesky, from the IC account, after the response.
    const name = data.get('name');
    afterResponse(args.context, () =>
      announceOnBluesky({
        text: `New game on Community: ${name}`,
        url: `${BASE_URL}${gamePath(game)}`,
        title: name,
        description:
          summarize(data.get('about')) ||
          "An indie game on Indie Collective's community database.",
      })
    );

    await notifyDiscord(
      `${currentUser.username} added game "${data.get(
        'name'
      )}" at ${new Date().toISOString()} - ${BASE_URL}${gamePath(game)}`
    );

    return redirect(gamePath(game));
  } catch (err) {
    const values = Object.fromEntries(data);
    values.tags = tagsList.map((t) => ({ name: t }));
    return { error: await actionErrorMessage(err), values };
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

export const meta = () => [
  {
    title: 'Add a game',
  },
];

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
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Add a game" />

      <GameForm
        method="POST"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || loaderData?.values}
      />
    </Box>
  );
};

export default CreateGame;
