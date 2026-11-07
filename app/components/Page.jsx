import {
  Box,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useId } from 'react';
import Link from './Link';

/**
 * Every page's column (design pass): the same gutters, and the same space
 * under the navigation and above the footer.
 */
export const Page = ({ children, ...rest }) => (
  <Box px={{ base: 4, md: 5 }} pt={{ base: 5, md: 7 }} pb={12} {...rest}>
    {children}
  </Box>
);

/**
 * A page's header (design pass): what kind of page it is (`eyebrow`, e.g.
 * "Studio · Lyon, France"), its title (the page's one h1), a line saying
 * what's here, and actions on the right, such as "Add a game".
 */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  children,
  ...rest
}) => (
  <Stack as="header" gap={2} mb={{ base: 6, md: 8 }} {...rest}>
    {eyebrow && (
      <Text fontSize="sm" fontWeight="medium" color="muted">
        {eyebrow}
      </Text>
    )}
    <Flex
      gap={3}
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'flex-start', sm: 'center' }}
      justify="space-between"
    >
      <Heading as="h1" size="2xl" minW={0} overflowWrap="anywhere">
        {title}
      </Heading>
      {actions && (
        <HStack gap={2} flexShrink={0} wrap="wrap">
          {actions}
        </HStack>
      )}
    </Flex>
    {description && (
      <Text color="muted" fontSize={{ base: 'md', md: 'lg' }} maxW="2xl">
        {description}
      </Text>
    )}
    {children}
  </Stack>
);

/**
 * A section of a page: its h2, with an optional count or action beside it.
 * Labelled by its heading, so it's a region screen readers can jump to.
 */
export const PageSection = ({ title, aside, children, ...rest }) => {
  const headingId = useId();
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      mb={{ base: 8, md: 10 }}
      {...rest}
    >
      <Flex justify="space-between" align="baseline" gap={3} mb={4} wrap="wrap">
        <Heading as="h2" id={headingId} size="xl">
          {title}
        </Heading>
        {aside}
      </Flex>
      {children}
    </Box>
  );
};

/**
 * The filters above a list: one panel, the same on every list page, its
 * controls wrapping on narrow screens.
 */
export const FilterBar = ({ children, ...rest }) => (
  <Flex
    role="group"
    aria-label="Filters"
    wrap="wrap"
    gap={3}
    align="center"
    p={3}
    mb={6}
    bg="surface"
    borderRadius="xl"
    shadow="xs"
    {...rest}
  >
    {children}
  </Flex>
);

/**
 * A department of the homepage magazine (magazine pass): a heavy rule, a
 * kicker saying what's in it, a big title, and a link to the full list.
 * Labelled by its heading, so it's a region screen readers can jump to.
 */
export const Department = ({
  title,
  kicker,
  to,
  linkLabel,
  children,
  ...rest
}) => {
  const headingId = useId();
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      minW={0}
      mb={{ base: 10, md: 14 }}
      {...rest}
    >
      <Flex
        align="flex-end"
        gap={3}
        wrap="wrap"
        borderTop="2px solid"
        borderColor="ink"
        pt={2}
        mb={5}
      >
        <Box minW={0}>
          {kicker && (
            <Text
              fontSize="xs"
              fontWeight="semibold"
              letterSpacing="wider"
              textTransform="uppercase"
              color="brandDeep"
            >
              {kicker}
            </Text>
          )}
          <Heading
            as="h2"
            id={headingId}
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight="800"
            letterSpacing="-0.03em"
            lineHeight="1"
          >
            {title}
          </Heading>
        </Box>
        {to && (
          <ChakraLink
            asChild
            ml="auto"
            fontWeight="semibold"
            fontSize="sm"
            borderBottom="2px solid"
            borderColor="brand"
            _hover={{ color: 'brand', textDecoration: 'none' }}
          >
            <Link to={to}>{linkLabel} →</Link>
          </ChakraLink>
        )}
      </Flex>
      {children}
    </Box>
  );
};
