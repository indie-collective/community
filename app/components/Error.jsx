import { Button, Stack, Text } from '@chakra-ui/react';
import { Link } from '@remix-run/react';

const statusCodes = {
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
  418: "I'm a teapot! 🍵",
  500: 'Internal Server Error',
};

function Error({ statusCode }) {
  return (
    <Stack textAlign="center" mt={20}>
      {statusCode && (
        <Text fontSize="150px" m={0} p={0} fontWeight="bold" lineHeight={1}>
          {statusCode}
        </Text>
      )}
      <Text fontSize="34px">
        {(statusCode && statusCodes[statusCode]) || 'An error occured!'}
      </Text>
      <Text fontSize="18px" mt={10}>
        <Button as={Link} to="/" size="lg">
          Let's go home !
        </Button>
      </Text>
    </Stack>
  );
}

export default Error;
