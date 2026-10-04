import { Text } from '@chakra-ui/react';

/**
 * What signed-in people see in an empty section, instead of a bare heading
 * (#198). Visitors don't see empty sections at all.
 */
const EmptyHint = ({ children, ...rest }) => (
  <Text color="fg.muted" fontSize="sm" alignSelf="center" {...rest}>
    {children}
  </Text>
);

export default EmptyHint;
