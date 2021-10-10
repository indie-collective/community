import { gql, useQuery } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0';

const currentPersonQuery = gql`
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

export default function useCurrentPerson() {
  const { isLoading, user } = useUser();
  const { data } = useQuery(currentPersonQuery, {
    fetchPolicy: 'cache-first',
    skip: isLoading || !user,
  });

  if (!user || isLoading || !data) return null;

  return {
    id: data.currentPerson.id,
    fullName: data.currentPerson.fullName,
    avatar: data.currentPerson.avatar?.url,
  };
}
