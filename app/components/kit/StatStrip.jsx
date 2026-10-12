import { Box, Grid, Text } from '@chakra-ui/react';

import Link from '../Link';
import KindDot from './KindDot';

/**
 * Counts side by side in one panel (design pass): each a number, a label
 * and, with `kind`, its kind's dot; with `to`, a link to the list.
 *
 * @param {{ items: { value: number, label: string, kind?: string, to?: string }[] }} props
 */
const StatStrip = ({ items, ...rest }) => (
  <Grid
    as="ul"
    listStyleType="none"
    templateColumns={{
      base: 'repeat(2, minmax(0, 1fr))',
      sm: `repeat(${items.length}, auto)`,
    }}
    justifyContent="start"
    bg="surface"
    borderRadius="xl"
    shadow="xs"
    overflow="hidden"
    {...rest}
  >
    {items.map(({ value, label, kind, to }) => {
      const content = (
        <>
          <Text
            fontFamily="heading"
            fontWeight="semibold"
            fontSize="xl"
            lineHeight="1.2"
            fontVariantNumeric="tabular-nums"
          >
            {value.toLocaleString('en')}
          </Text>
          <Text
            fontSize="sm"
            color="muted"
            display="flex"
            alignItems="center"
            gap="6px"
          >
            {kind && <KindDot kind={kind} />}
            {label}
          </Text>
        </>
      );
      return (
        <Box
          as="li"
          key={label}
          borderLeftWidth={{ base: 0, sm: '1px' }}
          _first={{ borderLeftWidth: 0 }}
          borderColor="border"
        >
          {to ? (
            <Box
              asChild
              display="block"
              px={4}
              py={2}
              transition="background-color 120ms"
              _hover={{ bg: 'bg.muted' }}
            >
              <Link to={to}>{content}</Link>
            </Box>
          ) : (
            <Box px={4} py={2}>
              {content}
            </Box>
          )}
        </Box>
      );
    })}
  </Grid>
);

export default StatStrip;
