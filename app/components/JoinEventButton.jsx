import { Button } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { Form, useNavigation } from 'react-router';

const JoinEventButton = ({
  currentPerson,
  eventId,
  isGoing,
  children,
  ...rest
}) => {
  const navigation = useNavigation();

  return (
    <Form method='post' action={`/event/${eventId}/${isGoing ? 'leave' : 'join'}`}>
      <Button
        variant={isGoing ? 'solid' : 'outline'}
        colorScheme="green"
        leftIcon={isGoing ? <CheckIcon /> : null}
        {...rest}
        type="submit"
        disabled={navigation.state === 'submitting'}
      >
        {navigation.state === 'submitting' ? 'Submitting...' : children}
      </Button>
    </Form>
  );
};

export default JoinEventButton;
