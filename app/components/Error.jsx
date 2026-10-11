import { Button, Heading, HStack, Stack, Text } from '@chakra-ui/react';
import { LuHouse, LuSearch } from 'react-icons/lu';
import { Link } from 'react-router';

const statusCodes = {
  400: 'Bad Request',
  404: 'Not Found',
  405: 'Method Not Allowed',
  418: "I'm a teapot! 🍵",
  500: 'Internal Server Error',
};

const explanations = {
  404: "This page doesn't exist, or it was moved or deleted.",
};

// An error page in the site's type (design pass), with ways onward.
function Error({ statusCode }) {
  return (
    <Stack
      align="center"
      textAlign="center"
      gap={4}
      px={4}
      py={{ base: 12, md: 20 }}
    >
      {statusCode && (
        <Text
          fontFamily="heading"
          fontWeight="bold"
          fontSize={{ base: '7xl', md: '8xl' }}
          lineHeight={1}
          color="muted"
          aria-hidden
        >
          {statusCode}
        </Text>
      )}
      <Heading as="h1" size="2xl">
        {(statusCode && statusCodes[statusCode]) || 'Something went wrong'}
      </Heading>
      <Text color="muted" fontSize="lg" maxW="md">
        {explanations[statusCode] ??
          'Try again, or start over from the homepage.'}
      </Text>
      <HStack gap={3} mt={4} wrap="wrap" justify="center">
        <Button asChild>
          <Link to="/">
            <LuHouse />
            Go home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/search">
            <LuSearch />
            Search
          </Link>
        </Button>
      </HStack>
    </Stack>
  );
}

export default Error;
