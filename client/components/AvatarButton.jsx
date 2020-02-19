import { IconButton, Avatar } from '@chakra-ui/core';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Link from 'next/link';

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
    return (
      <Link href="/profile">
        <a>
          <Avatar size="sm" name={data.currentPerson.fullName} ml={5} />
        </a>
      </Link>
    );
  }

  return (
    <Link href="/signin">
      <IconButton
        ml={5}
        variantColor="teal"
        aria-label="Signin"
        size="sm"
        icon="chevron-right"
        variant="ghost"
      />
    </Link>
  );
};

export default AvatarButton;
