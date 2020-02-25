import { IconButton, Avatar } from '@chakra-ui/core';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Link from 'next/link';

const currentPerson = gql`
  {
    currentPerson {
      id
      fullName
      avatar {
        url
      }
    }
  }
`;

const AvatarButton = () => {
  const { data } = useQuery(currentPerson, { fetchPolicy: 'network-only' });

  if (data && data.currentPerson !== null) {
    const {fullName, avatar} = data.currentPerson;

    return (
      <Link href="/profile">
        <a>
          <Avatar size="sm" name={fullName} ml={5} src={avatar && avatar.url} />
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
