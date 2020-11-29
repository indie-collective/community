import { gql, useMutation } from '@apollo/client';
import { Button } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

import useCurrentPerson from '../hooks/useCurrentPerson';

const participantFragment = gql`
  fragment EventParticipant on Person {
    id
    avatar {
      thumbnail_url
    }
  }
`;

const joinEventMutation = gql`
  ${participantFragment}

  mutation joinEvent($eventId: UUID!, $personId: UUID!) {
    createEventParticipant(
      input: { eventParticipant: { eventId: $eventId, personId: $personId } }
    ) {
      person {
        ...EventParticipant
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
    update(cache, { data: { createEventParticipant } }) {
      cache.modify({
        id: cache.identify({id: eventId, __typename: 'Event'}),
        fields: {
          participants(participantsRef) {
            const newParticipantRef = cache.writeFragment({
              fragment: participantFragment,
              data: createEventParticipant.person,
            });

            return {
              ...participantsRef,
              nodes: [...participantsRef.nodes, newParticipantRef],
              totalCount: participantsRef.totalCount + 1,
            };
          },
        },
      });
    },
  });
  const [leaveEvent] = useMutation(leaveEventMutation, {
    variables: { eventId, personId: currentPerson.id },
    update(cache, { data: { deleteEventParticipant } }) {
      cache.modify({
        id: cache.identify({id: eventId, __typename: 'Event'}),
        fields: {
          participants(participantsRef, { readField }) {
            const newNodesList = participantsRef.nodes.filter(
              nodeRef => deleteEventParticipant.person.id !== readField('id', nodeRef)
            );

            return {
              ...participantsRef,
              totalCount: newNodesList.length,
              nodes: newNodesList,
            };
          },
        },
      });
    },
  });

  return (
    <Button
      variant={isGoing ? 'solid' : 'outline'}
      colorScheme="teal"
      leftIcon={isGoing ? <CheckIcon /> : null}
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
