import { Box, Heading } from '@chakra-ui/core';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

import SigninForm from '../components/SigninForm';

const signinMutation = gql`
  mutation signin($email: String!, $password: String!) {
    authenticate(input: { email: $email, password: $password }) {
      jwtToken
    }
  }
`;

export default () => {
  const [signin, { data, loading }] = useMutation(signinMutation);

  return (
    <Box width={500} margin="40px auto">
      <Heading mb={5}>Sign In</Heading>
      <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
        <SigninForm onSubmit={variables => signin({ variables })} />
      </Box>
    </Box>
  );
};
