import {
  Box,
  Heading,
  Link as ChakraLink,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';

import Navigation from '../components/Navigation';
import SigninForm from '../components/SigninForm';

export const meta = () => ({
  title: 'Sign In',
});

const SignIn = () => {
  return (
    <Box>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Sign in
        </Heading>
        <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
          <Text as="span">Don&apos;t have an account? </Text>
          <ChakraLink
            as={Link}
            to="/signup"
            color={mode('teal.600', 'teal.200')}
            fontWeight="semibold"
          >
            Sign up
          </ChakraLink>
        </Text>

        <SigninForm
          onSubmit={async (variables) => {
            // const { data } = await signin({ variables });

            // if (data && data.authenticate.jwtToken !== null) {
            //   document.cookie = `token=${data.authenticate.jwtToken};max-age=${
            //     60 * 60 * 24 * 365
            //   }`;

            //   push('/');
            // }
          }}
          loading={false}
        />
      </Box>
    </Box>
  );
};

export default SignIn;
