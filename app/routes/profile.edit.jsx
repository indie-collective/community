import { Box, Heading } from '@chakra-ui/react';
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { useEffect } from 'react';

import { getProfileForEdit, updateProfile } from '../data/people.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import { parseFormWithUploads } from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import ProfileForm from '../components/ProfileForm';
import { commitSession, getSession } from '../utils/session.server';
import toSessionUser from '../utils/sessionUser.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  return {
    currentUser: await getProfileForEdit(currentUser.id),
  };
};

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  const data = await parseFormWithUploads(request, ['avatar']);

  try {
    const user = await updateProfile(currentUser.id, {
      avatarId: data.get('avatar'),
      firstName: data.get('firstName'),
      lastName: data.get('lastName') || null,
      username: data.get('username'),
      about: data.get('about') || null,
    });

    // updating session
    let session = await getSession(request.headers.get('cookie'));
    // 'user' is the key every read uses; remix-auth v4 has no sessionKey.
    session.set(
      'user',
      toSessionUser(user)
    );

    return redirect(`/profile`, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (err) {
    console.log(err);
    const values = Object.fromEntries(data);
    return { error: err.message, values };
  }
};

export const meta = () => [
  {
    title: 'Edit profile',
  },
];

const Profile = () => {
  const { currentUser } = useLoaderData();
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
      })
    );
  }, [actionData?.error, navigation.state === 'submitting']);

  return (
    <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
      <Heading mb={5}>Profile</Heading>

      <ProfileForm
        method="post"
        loading={navigation.state === 'submitting'}
        defaultData={actionData?.values || currentUser}
      />
    </Box>
  );
};

export default Profile;
