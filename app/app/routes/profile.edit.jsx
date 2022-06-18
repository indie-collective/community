import { Box, Heading, useToast } from '@chakra-ui/react';
import { useActionData, useLoaderData, useTransition } from '@remix-run/react';
import {
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { useEffect } from 'react';

import { db } from '../utils/db.server';
import { authenticator } from '../utils/auth.server';
import createUploadHandler from '../utils/createUploadHandler.server';
import Navigation from '../components/Navigation';
import ProfileForm from '../components/ProfileForm';
import { commitSession, getSession } from '../utils/session.server';
import getImageLinks from '../utils/imageLinks.server';

export const loader = async ({ request }) => {
  const { id } = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

  const user = await db.person.findUnique({
    where: { id },
    include: {
      avatar: true,
    }
  });

  const data = {
    currentUser: {
      ...user,
      avatar: user.avatar
        ? getImageLinks(user.avatar).thumbnail_url
        : undefined,
    },
  };

  return json(data);
};

export const action = async ({ request }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: '/signin',
  });

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
        about: data.get('about'),
      },
      include: {
        avatar: true,
      }
    });

    delete user.password_hash;

    // updating session
    let session = await getSession(request.headers.get('cookie'));
    session.set(authenticator.sessionKey, {
      ...user,
      avatar: user.avatar ? getImageLinks(user.avatar).thumbnail_url : undefined,
    });

    return redirect(`/profile`, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (err) {
    console.log(err);
    const values = Object.fromEntries(data);
    return json({ error: err.message, values });
  }
};

export const meta = () => ({
  title: 'Edit profile',
});

const Profile = () => {
  const { currentUser } = useLoaderData();
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
        <Heading mb={5}>Profile</Heading>

        <ProfileForm
          method="post"
          loading={transition.state === 'submitting'}
          defaultData={actionData?.values || currentUser}
        />
      </Box>
    </div>
  );
};

export default Profile;
