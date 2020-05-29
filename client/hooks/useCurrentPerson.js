import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

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
