import { IconButton, Avatar } from '@chakra-ui/core';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import NextLink from 'next/link';

const currentPerson = gql`
  {
    currentPerson {
      firstName
      lastName
      fullName
    }
  }
`;

const AvatarButton = () => {
  const { data } = useQuery(currentPerson, { fetchPolicy: 'network-only' });

  if (data && data.currentPerson !== null) {
    return <Avatar size="sm" name={data.currentPerson.fullName} ml={5} />;
  }

  return (
    <NextLink href="/signin">
      <IconButton
        ml={5}
        variantColor="teal"
        aria-label="Signin"
        size="sm"
        icon="chevron-right"
        variant="ghost"
      />
    </NextLink>
  );
};

export default AvatarButton;
