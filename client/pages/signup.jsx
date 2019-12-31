import { Box, Heading } from '@chakra-ui/core';

import SignupForm from '../components/SignupForm';

export default () => (
  <Box width={500} margin="40px auto">
    <Heading mb={5}>Sign Up</Heading>
    <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
      <SignupForm onSubmit={console.log} />
    </Box>
  </Box>
);
