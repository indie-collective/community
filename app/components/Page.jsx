import {
  Box,
  Flex,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useId } from 'react';

import KindDot from './kit/KindDot';
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
      <Box fontSize="sm" fontWeight="medium" color="muted">
        {eyebrow}
      </Box>
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
 * Where a record page sits (design pass): its list, then what it is, e.g.
 * "Studios / ● Studio · Closed". `label` is plain text, so it reads (and
 * matches) as one line.
 */
export const Crumb = ({ to, list, kind, label }) => (
  <HStack gap={2} wrap="wrap">
    <Link to={to}>{list}</Link>
    <Text as="span" aria-hidden>
      /
    </Text>
    <HStack as="span" gap={1.5}>
      <KindDot kind={kind} />
      <span>{label}</span>
    </HStack>
  </HStack>
);

/**
 * A record page's body (design pass): the content, and its fact sheet
 * beside it on wide screens (staying in view as the page scrolls) or
 * after the opening content on narrow ones.
 */
export const DetailLayout = ({ children, aside }) => (
  <Grid
    templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 300px' }}
    gap={8}
    alignItems="start"
  >
    <Box minW={0}>{children}</Box>
    <Box minW={0} position={{ lg: 'sticky' }} top={{ lg: 4 }}>
      {aside}
    </Box>
  </Grid>
);
