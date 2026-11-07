import { Button, Flex, Image, Stack, Text } from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';

import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import Link from './Link';

/**
 * What's missing, in a muted sentence (no period), and the way to add it
 * when there is one (`action`, a small secondary button, for members). An
 * empty section is a dashed box; a whole empty list (`picture`) has the
 * picture above, centred (#198).
 */
const Empty = ({ picture = false, action, children, ...rest }) =>
  picture ? (
    <Stack align="center" textAlign="center" gap={4} py={6} {...rest}>
      <Image src={noEventsImage} alt="" maxW="180px" />
      <Text fontSize="lg" color="muted">
        {children}
      </Text>
      {action}
    </Stack>
  ) : (
    <Flex
      align="center"
      justify="space-between"
      gap={4}
      wrap="wrap"
      px={4}
      py={3}
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="rule"
      rounded="card"
      {...rest}
    >
      <Text fontSize="sm" color="muted">
        {children}
      </Text>
      {action}
    </Flex>
  );

export default Empty;

/** The way to add what's missing: a small secondary button to a form. */
export const EmptyAction = ({ to, children }) => (
  <Button asChild size="sm" variant="outline">
    <Link to={to}>
      <LuPlus />
      {children}
    </Link>
  </Button>
);
