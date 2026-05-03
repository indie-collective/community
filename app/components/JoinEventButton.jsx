import { Button } from '@chakra-ui/react';
import { LuCheck } from 'react-icons/lu';
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
        colorPalette="green"
        {...rest}
        type="submit"
        disabled={navigation.state === 'submitting'}>{isGoing ? <LuCheck /> : null}{navigation.state === 'submitting' ? 'Submitting...' : children}</Button>
    </Form>
  );
};

export default JoinEventButton;
