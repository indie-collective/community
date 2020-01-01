import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';
import { Box, Heading, Text, Button } from '@chakra-ui/core';
import NextLink from 'next/link';

import SignupForm from '../components/SignupForm';

const signupMutation = gql`
  mutation signup(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
  ) {
    registerPerson(
      input: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
      }
    ) {
      person {
        id
        firstName
        lastName
      }
    }
  }
`;

export default () => {
  const [signin, { data, loading, error }] = useMutation(signupMutation);

  if (!loading && !error && data) {
    return (
      <Box maxWidth={500} margin="40px auto">
        <Heading mb={4}>
          Hi there, {data.registerPerson.person.firstName}!
        </Heading>
        <Text fontSize="xl">Welcome to the community!</Text>
        <NextLink href="/signin">
          <Button color="teal.500" mt="24px">Sign in</Button>
        </NextLink>
      </Box>
    );
  }

  return (
    <Box maxWidth={500} margin="40px auto">
      <Heading mb={5}>Sign Up</Heading>
      <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
        <SignupForm
          loading={loading}
          onSubmit={variables => signin({ variables })}
        />
      </Box>
      {data && <pre>{JSON.stringify(data, false, 2)}</pre>}
    </Box>
  );
};
