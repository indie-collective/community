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
  const { data } = useQuery(currentPersonQuery, {
    fetchPolicy: 'network-only',
  });

  return (data && data.currentPerson) || null;
}
