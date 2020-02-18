import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { Box, Heading, Text, Button, Link as ChakraLink } from '@chakra-ui/core';
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
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

const SignUp = () => {
  const [signin, { data, loading, error }] = useMutation(signupMutation);

  if (!loading && !error && data) {
    return (
      <Box>
        <Navigation />

        <Box maxWidth={500} margin="40px auto">
          <Heading mb={4}>
            Hi there, {data.registerPerson.person.firstName}!
          </Heading>
          <Text fontSize="xl">Welcome to the community!</Text>
          <Link href="/signin">
            <Button color="teal.500" mt="24px">Sign in</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navigation />

      <Box maxWidth={500} margin="40px auto">
        <Box display="flex" alignItems="baseline">
          <Heading mb={5} flex={1}>Sign Up</Heading>
          <Link href="/signin"><ChakraLink>Already registered?</ChakraLink></Link>
        </Box>

        <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
          <SignupForm
            loading={loading}
            onSubmit={variables => signin({ variables })}
          />
        </Box>
        {data && <pre>{JSON.stringify(data, false, 2)}</pre>}
      </Box>
    </Box>
  );
};

export default withApollo()(SignUp);
