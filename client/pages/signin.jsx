import { Box, Heading, Link as ChakraLink } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

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
  const { push } = useRouter();

  return (
    <Box>
      <Head>
        <title>Sign In</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Box display="flex" alignItems="baseline">
          <Heading mb={5} flex={1}>
            Sign In
          </Heading>
          <Link href="/signup">
            <ChakraLink>No account?</ChakraLink>
          </Link>
        </Box>

        <Box borderWidth="1px" mb={10} p={3} borderRadius={5}>
          <SigninForm
            onSubmit={async variables => {
              const { data } = await signin({ variables });

              if (data && data.authenticate.jwtToken !== null) {
                document.cookie = `token=${
                  data.authenticate.jwtToken
                };max-age=${60 * 60 * 24 * 365}`;

                push('/');
              }
            }}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default withApollo()(SignIn);
