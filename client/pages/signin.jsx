import { Box, Heading } from '@chakra-ui/core';

import SigninForm from '../components/SigninForm';

export default () => (
  <Box width={500} margin="40px auto">
    <Heading mb={5}>Sign Up</Heading>
    <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
      <SigninForm onSubmit={console.log} />
    </Box>
  </Box>
);
