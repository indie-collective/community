import { gql, useQuery } from '@apollo/client';

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
  const { data, loading, error } = useQuery(currentPersonQuery, {
    fetchPolicy: 'cache-and-network',
  });

  if (!loading && error) {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  return (data && data.currentPerson) || null;
}
