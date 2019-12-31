import { Box, Heading } from '@chakra-ui/core';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

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

export default () => {
  const [signin, { data, loading }] = useMutation(signupMutation);

  return (
    <Box maxWidth={500} margin="40px auto">
      <Heading mb={5}>Sign Up</Heading>
      <Box border="1px solid #eee" mb={10} p={3} borderRadius={5}>
        <SignupForm onSubmit={variables => signin({ variables })} />
      </Box>
      {data && <pre>{JSON.stringify(data, false, 2)}</pre>}
    </Box>
  );
};
