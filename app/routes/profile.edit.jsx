import { Box, Heading } from '@chakra-ui/react';
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import isAuthenticated from '../utils/isAuthenticated.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import { toaster } from '../components/ui/toaster';
import ProfileForm from '../components/ProfileForm';
import { commitSession, getSession } from '../utils/session.server';
import getImageLinks from '../utils/imageLinks.server';

export const loader = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  const user = await db.person.findUnique({
    where: { id: currentUser.id },
    include: {
      avatar: true,
    },
  });

  return {
    currentUser: {
      ...user,
      avatar: user.avatar
        ? getImageLinks(user.avatar).thumbnail_url
        : undefined,
    },
  };
};

export const action = async ({ request }) => {
  const currentUser = await isAuthenticated(request, true);

  const data = await unstable_parseMultipartFormData(
    request,
    unstable_composeUploadHandlers(
      createUploadHandler(['avatar']),
      unstable_createMemoryUploadHandler()
    )
  );

  try {
    const user = await db.person.update({
      where: {
        id: currentUser.id,
      },
      data: {
        avatar_id: data.get('avatar') ? data.get('avatar') : undefined,
        first_name: data.get('firstName'),
        last_name: data.get('lastName'),
        username: data.get('username'),
        about: data.get('about'),
      },
      include: {
        avatar: true,
      },
    });

    delete user.password_hash;

    // updating session
    let session = await getSession(request.headers.get('cookie'));
    session.set(authenticator.sessionKey, {
      ...user,
      avatar: user.avatar
        ? getImageLinks(user.avatar).thumbnail_url
        : undefined,
    });

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

    toaster.create({
      title: 'Something went wrong',
      description: actionData?.error,
      status: 'error',
    });
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
