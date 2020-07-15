import { gql, useMutation } from '@apollo/client';
import { Button } from '@chakra-ui/core';

import useCurrentPerson from '../hooks/useCurrentPerson';

const eventFragment = gql`
  fragment EventParticipants on Event {
    id
    participants {
      totalCount
      nodes {
        id
        avatar {
          thumbnail_url
        }
      }
    }
  }
`;

const joinEventMutation = gql`
  mutation joinEvent($eventId: UUID!, $personId: UUID!) {
    createEventParticipant(
      input: { eventParticipant: { eventId: $eventId, personId: $personId } }
    ) {
      person {
        id
        avatar {
          thumbnail_url
        }
      }
    }
  }
`;

const leaveEventMutation = gql`
  mutation leaveEvent($eventId: UUID!, $personId: UUID!) {
    deleteEventParticipant(input: { eventId: $eventId, personId: $personId }) {
      person {
        id
      }
    }
  }
`;

const JoinEventLoggedInButton = ({
  currentPerson,
  eventId,
  isGoing,
  children,
  ...rest
}) => {
  const [joinEvent] = useMutation(joinEventMutation, {
    variables: { eventId, personId: currentPerson.id },
    update(proxy, { data: { createEventParticipant } }) {
      const data = proxy.readFragment({
        id: eventId,
        fragment: eventFragment,
        fragmentName: 'EventParticipants',
      });

      const participantsNodes = [
        ...data.participants.nodes,
        { __typename: 'Person', ...createEventParticipant.person },
      ];

      proxy.writeFragment({
        id: eventId,
        fragment: eventFragment,
        fragmentName: 'EventParticipants',
        data: {
          ...data,
          participants: {
            __typename: 'EventParticipantsManyToManyConnection',
            totalCount: participantsNodes.length,
            nodes: participantsNodes,
          },
        },
      });
    },
  });
  const [leaveEvent] = useMutation(leaveEventMutation, {
    variables: { eventId, personId: currentPerson.id },
    update(proxy, { data: { deleteEventParticipant } }) {
      const data = proxy.readFragment({
        id: eventId,
        fragment: eventFragment,
        fragmentName: 'EventParticipants',
      });

      const participantsNodes = data.participants.nodes.filter(
        ({ id }) => id !== deleteEventParticipant.person.id
      );

      proxy.writeFragment({
        id: eventId,
        fragment: eventFragment,
        fragmentName: 'EventParticipants',
        data: {
          ...data,
          participants: {
            __typename: 'EventParticipantsManyToManyConnection',
            totalCount: participantsNodes.length,
            nodes: participantsNodes,
          },
        },
      });
    },
  });

  return (
    <Button
      variant={isGoing ? 'solid' : 'outline'}
      variantColor="teal"
      leftIcon={isGoing ? 'check' : null}
      onClick={() =>
        isGoing
          ? leaveEvent({
              optimisticResponse: {
                __typename: 'Mutation',
                deleteEventParticipant: {
                  __typename: 'DeleteEventParticipantPayload',
                  person: { __typename: 'Person', ...currentPerson },
                },
              },
            })
          : joinEvent({
              optimisticResponse: {
                __typename: 'Mutation',
                createEventParticipant: {
                  __typename: 'CreateEventParticipantPayload',
                  person: { __typename: 'Person', ...currentPerson },
                },
              },
            })
      }
      {...rest}
    >
      {children}
    </Button>
  );
};

const JoinEventButton = ({ ...rest }) => {
  const currentPerson = useCurrentPerson();

  // TODO: redirect to login/popup on click
  if (!currentPerson) return null;

  return <JoinEventLoggedInButton currentPerson={currentPerson} {...rest} />;
};

export default JoinEventButton;
