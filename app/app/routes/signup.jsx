import {
  Box,
  Heading,
  Text,
  Button,
  Link as ChakraLink,
  useColorModeValue as mode,
} from '@chakra-ui/react';
import { Link } from '@remix-run/react';

import Navigation from '../components/Navigation';
import SignupForm from '../components/SignupForm';

export const meta = () => ({
  title: 'Sign Up',
})

const SignUp = () => {
  // if (!loading && !error && data) {
  //   return (
  //     <Box>
  //       <Navigation />

  //       <Box maxWidth={500} margin="40px auto">
  //         <Heading mb={4}>
  //           Hi there, {data.registerPerson.person.firstName}!
  //         </Heading>
  //         <Text fontSize="xl">Welcome to the club!</Text>
  //         <Link href="/signin">
  //           <Button color="teal.500" mt="24px">
  //             Sign in
  //           </Button>
  //         </Link>
  //       </Box>
  //     </Box>
  //   );
  // }

  return (
    <Box>
      <Navigation />

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading textAlign="center" size="xl" fontWeight="extrabold">
          Join the club!
        </Heading>
        <Text mt="4" mb="8" align="center" maxW="md" fontWeight="medium">
          <Text as="span">Already have an account? </Text>
          <ChakraLink
            as={Link}
            to="/signin"
            color={mode('teal.600', 'teal.200')}
            fontWeight="semibold"
          >
            Sign in
          </ChakraLink>
        </Text>

        <SignupForm
          loading={false}
          // onSubmit={(variables) => signin({ variables })}
        />
      </Box>
    </Box>
  );
};

export default SignUp;
