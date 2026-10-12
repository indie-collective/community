import { Box, Grid, Text } from '@chakra-ui/react';

/**
 * A record's key facts beside its page (design pass): labels and values
 * in one panel, easy to scan. Facts without a value are left out.
 *
 * @param {{ facts: [string, React.ReactNode][] }} props
 */
const FactSheet = ({ facts, children, ...rest }) => (
  <Box
    as="aside"
    aria-label="Key facts"
    bg="surface"
    borderRadius="xl"
    shadow="xs"
    overflow="hidden"
    {...rest}
  >
    <Box as="dl">
      {facts
        .filter(([, value]) => value != null && value !== false && value !== '')
        .map(([label, value]) => (
          <Grid
            key={label}
            templateColumns="6.5em minmax(0, 1fr)"
            gap={3}
            px={4}
            py={2.5}
            borderTopWidth="1px"
            borderColor="border"
            _first={{ borderTopWidth: 0 }}
            fontSize="sm"
          >
            <Text as="dt" color="muted" fontWeight="medium">
              {label}
            </Text>
            <Box as="dd" minW={0} overflowWrap="anywhere">
              {value}
            </Box>
          </Grid>
        ))}
    </Box>
    {children}
  </Box>
);

export default FactSheet;
