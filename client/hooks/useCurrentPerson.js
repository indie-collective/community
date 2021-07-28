import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

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
  const { push } = useRouter();
  const { data, loading, error } = useQuery(currentPersonQuery, {
    fetchPolicy: 'cache-and-network',
  });

  if (!loading && error) {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    push('/login');
  }

  return (data && data.currentPerson) || null;
}
