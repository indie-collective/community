import { Box, Heading } from '@chakra-ui/react';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';

import Navigation from '../components/Navigation';
import ProfileForm from '../components/ProfileForm';

export const loader = () => {
  // if (!user) redirect to /signin

  const data = {
    currentUser: {
      id: '1',
      username: 'admin',
      name: 'John Doe',
      email: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      about: '',
      avatar: null,
    },
  };

  return json(data);
};

export const meta = () => ({
  title: 'Edit profile',
});

const Profile = () => {
  const { currentUser } = useLoaderData();

  return (
    <div>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Profile</Heading>

        <ProfileForm defaultData={currentUser} />
      </Box>
    </div>
  );
};

export default Profile;
