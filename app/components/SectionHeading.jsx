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
  size = 'md',
  badgeProps,
  ...rest
}) => (
  <HStack gap={2} align="baseline" {...rest}>
    <Heading size={size}>{children}</Heading>
    <Badge variant="subtle" colorPalette="green" fontSize="md" {...badgeProps}>
      {count}
      <VisuallyHidden> {countLabel}</VisuallyHidden>
    </Badge>
  </HStack>
);

export default SectionHeading;
