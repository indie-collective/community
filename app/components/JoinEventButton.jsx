import { Button } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { Form, useTransition } from '@remix-run/react';

const JoinEventButton = ({
  currentPerson,
  eventId,
  isGoing,
  children,
  ...rest
}) => {
  const transition = useTransition();

  return (
    <Form method='post' action={`/event/${eventId}/${isGoing ? 'leave' : 'join'}`}>
      <Button
        variant={isGoing ? 'solid' : 'outline'}
        colorScheme="teal"
        leftIcon={isGoing ? <CheckIcon /> : null}
        {...rest}
        type="submit"
        disabled={transition.state === 'submitting'}
      >
        {transition.state === 'submitting' ? 'Submitting...' : children}
      </Button>
    </Form>
  );
};

export default JoinEventButton;
