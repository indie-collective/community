import { Box } from '@chakra-ui/react';
// import differenceWith from 'lodash.differencewith';
import { redirect } from 'react-router';
import { useActionData, useLoaderData, useNavigation } from 'react-router';
import { useEffect } from 'react';

import isAuthenticated from '../utils/isAuthenticated.server';
import { authorizer, canWrite } from '../utils/auth.server';
import { toaster } from '../components/ui/toaster';
import GameForm from '../components/GameForm';
import { getGameForEdit, resolveGameTags, updateGame } from '../data/games.server';
import { gamePath } from '../utils/slug';
import { routeRecordId } from '../utils/pageRecord.server';
import { PageHeader } from '../components/Page';

const uuidRegex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

export const loader = async ({ request, params }) => {
  const id = await routeRecordId('game', params.id);

  const currentUser = await isAuthenticated(request, true);

  if (!uuidRegex.test(id))
    throw new Response('Not Found', {
      status: 404,
    });

  const game = await getGameForEdit(id);
  if (!game) throw new Response('Not Found', { status: 404 });

  return {
    game,
    currentUser,
  };
};

export async function action(args) {
  const { request, params } = args;
  const id = await routeRecordId('game', params.id);

  const currentUser = await authorizer.authorize(args, {
    rules: [canWrite],
  });

  const data = await request.formData();

  try {
    const [, igdb_slug = null] =
      (data.get('igdb_url') || '').match(/games\/(.+)/) || [];

    const game = await updateGame(id, {
      name: data.get('name'),
      about: data.get('about'),
      site: data.get('site'),
      igdbSlug: igdb_slug,
      tagNames: await resolveGameTags(data.get('tags')),
      authorId: currentUser.id,
    });

    return redirect(gamePath(game));
  } catch (err) {
    console.log(err);

    const values = Object.fromEntries(data);
    return { error: 'Updating the game failed', values };
  }
}

export const meta = ({
  data
}) => [{
  title: `Edit "${data.game.name}" | Games`
}];

const EditGame = () => {
  const { game } = useLoaderData();
    const navigation = useNavigation();
  const actionData = useActionData();

  useEffect(() => {
    if (!actionData?.error) return;

    // Deferred: creating a toast while React commits triggers flushSync.
    queueMicrotask(() =>
      toaster.create({
        title: 'Something went wrong',
        description: actionData?.error,
        type: 'error',
        position: 'bottom-right',
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box maxW="560px" mx="auto" px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12}>
      <PageHeader title="Edit game" />

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
        loading={navigation.state === 'submitting'}
      />
    </Box>
  );
};

export default EditGame;
