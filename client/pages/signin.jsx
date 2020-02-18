import { Box, Heading, Link as ChakraLink } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router'
import Link from 'next/link';

import { withApollo } from '../lib/apollo';
import Navigation from '../components/Navigation';
import SigninForm from '../components/SigninForm';

const signinMutation = gql`
  mutation signin($email: String!, $password: String!) {
    authenticate(input: { email: $email, password: $password }) {
      jwtToken
    }
  }
`;

const SignIn = () => {
  const [signin, { data, loading, error }] = useMutation(signinMutation);

  if (!loading && !error && data && data.authenticate.jwtToken !== null) {
    localStorage.setItem('token', data.authenticate.jwtToken);
    Router.push('/');
  }

  return (
    <Box>
      <Navigation />

      <Box width={500} margin="40px auto">
        <Box display="flex" alignItems="baseline">
          <Heading mb={5} flex={1}>Sign In</Heading>
          <Link href="/signup"><ChakraLink>No account?</ChakraLink></Link>
        </Box>

        <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
          <SigninForm onSubmit={variables => signin({ variables })} />
        </Box>
      </Box>
    </Box>
  );
};

export default withApollo()(SignIn);
