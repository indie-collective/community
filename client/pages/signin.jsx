import {
  Box,
  Heading,
  Link as ChakraLink,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { gql, useMutation } from '@apollo/client';
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

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Sign in
        </Heading>
        <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
          <Text as="span">Don&apos;t have an account? </Text>
          <Link href="/signup" passHref>
            <ChakraLink
              color={mode('teal.600', 'teal.200')}
              fontWeight="semibold"
            >
              Sign up
            </ChakraLink>
          </Link>
        </Text>

        <SigninForm
          onSubmit={async (variables) => {
            const { data } = await signin({ variables });

            if (data && data.authenticate.jwtToken !== null) {
              document.cookie = `token=${data.authenticate.jwtToken};max-age=${
                60 * 60 * 24 * 365
              }`;

              push('/');
            }
          }}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default withApollo()(SignIn);
