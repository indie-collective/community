import { gql, useMutation } from '@apollo/client';
import {
  Box,
  Heading,
  Text,
  Button,
  Link as ChakraLink,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import Link from 'next/link';
import Head from 'next/head';

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
        <Head>
          <title>Sign Up</title>
        </Head>

        <Navigation />

        <Box maxWidth={500} margin="40px auto">
          <Heading mb={4}>
            Hi there, {data.registerPerson.person.firstName}!
          </Heading>
          <Text fontSize="xl">Welcome to the club!</Text>
          <Link href="/signin">
            <Button color="teal.500" mt="24px">
              Sign in
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Join the club!
        </Heading>
        <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
          <Text as="span">Already have an account? </Text>
          <Link href="/signin" passHref>
            <ChakraLink
              color={mode('teal.600', 'teal.200')}
              fontWeight="semibold"
            >
              Sign in
            </ChakraLink>
          </Link>
        </Text>

        <SignupForm
          loading={loading}
          onSubmit={(variables) => signin({ variables })}
        />
        {data && <pre>{JSON.stringify(data, false, 2)}</pre>}
      </Box>
    </Box>
  );
};

export default withApollo()(SignUp);
