import {
  Box,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Stack,
  Text,
  VisuallyHidden,
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
    borderRadius="panel"
    shadow="raised"
    {...rest}
  >
    {children}
  </Flex>
);

/**
 * A section's title: the h2, and beside it, when given, a muted count read
 * as "8 games". The count stays out of the heading (#197: inside it, the
 * heading read "Games8"). `big` is the homepage's size.
 */
export const SectionTitle = ({
  id,
  count,
  countLabel = 'items',
  big = false,
  children,
  ...rest
}) => (
  <HStack gap={2} align="baseline" wrap="wrap" {...rest}>
    <Heading
      as="h2"
      id={id}
      fontSize={big ? { base: '3xl', md: '4xl' } : { base: 'xl', md: '2xl' }}
      fontWeight="600"
      letterSpacing="-0.02em"
      lineHeight="1.1"
    >
      {children}
    </Heading>
    {count != null && (
      <Text as="span" color="muted" fontSize={big ? '2xl' : 'lg'}>
        {count.toLocaleString('en')}
        {/* "1 game", "8 games": the label is plural, one drops its "s". */}
        <VisuallyHidden> {count === 1 ? countLabel.replace(/s$/, '') : countLabel}</VisuallyHidden>
      </Text>
    )}
  </HStack>
);

/**
 * A section of a page: its title with an optional count, an optional line
 * above it saying what's in it, and on the right a link to the whole list
 * or anything else (`aside`). No rule: space sets sections apart. `big` is
 * the homepage's large title. Labelled by its heading, so it's a region
 * screen readers can jump to.
 */
export const Section = ({
  title,
  kicker,
  count,
  countLabel,
  to,
  linkLabel,
  aside,
  big = false,
  children,
  ...rest
}) => {
  const headingId = useId();
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      minW={0}
      mb={big ? { base: 10, md: 14 } : { base: 8, md: 10 }}
      {...rest}
    >
      <Flex
        align="flex-end"
        gap={3}
        wrap="wrap"
        mb={big ? 5 : 4}
      >
        <Box minW={0}>
          {kicker && (
            <Text fontSize="sm" color="muted">
              {kicker}
            </Text>
          )}
          <SectionTitle id={headingId} count={count} countLabel={countLabel} big={big}>
            {title}
          </SectionTitle>
        </Box>
        {(to || aside) && (
          <Box ml="auto">
            {to ? (
              <ChakraLink
                asChild
                fontWeight="semibold"
                fontSize="sm"
                borderBottom="2px solid"
                borderColor="brand"
                _hover={{ color: 'primary.fg', textDecoration: 'none' }}
              >
                <Link to={to}>{linkLabel} →</Link>
              </ChakraLink>
            ) : (
              aside
            )}
          </Box>
        )}
      </Flex>
      {children}
    </Box>
  );
};
