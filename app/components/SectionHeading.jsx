import { Badge, Heading, HStack, VisuallyHidden } from '@chakra-ui/react';

/**
 * A section heading with its item count beside it, not inside it: a badge
 * inside the heading made its text "Games23" for screen readers, the
 * outline and crawlers (#197). The count is announced as "23 games".
 */
const SectionHeading = ({
  children,
  count,
  countLabel = 'items',
  size = 'xl',
  badgeProps,
  ...rest
}) => (
  <HStack gap={2} align="baseline" {...rest}>
    <Heading as="h2" size={size}>
      {children}
    </Heading>
    <Badge variant="subtle" colorPalette="gray" fontSize="sm" {...badgeProps}>
      {count}
      <VisuallyHidden> {countLabel}</VisuallyHidden>
    </Badge>
  </HStack>
);

export default SectionHeading;
