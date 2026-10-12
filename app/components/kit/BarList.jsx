import { Box, Flex, Grid, Text } from '@chakra-ui/react';

import Link from '../Link';

/**
 * Bars drawn to one scale (design pass): each row a label, a bar of one or
 * more parts (stacked, each its own colour) and the value. The longest
 * bar is the largest total.
 *
 * @param {{ rows: { key: string, label: React.ReactNode, parts: { value: number, color: string, label?: string }[], to?: string, value?: React.ReactNode }[], labelWidth?: string }} props
 */
const BarList = ({ rows, labelWidth = '7.5em', ...rest }) => {
  const max = Math.max(1, ...rows.map((row) => sum(row.parts)));
  return (
    <Box as="ul" listStyleType="none" display="grid" gap={2} {...rest}>
      {rows.map((row) => {
        const total = sum(row.parts);
        const bar = (
          <Grid
            templateColumns={`minmax(0, ${labelWidth}) minmax(0, 1fr) auto`}
            gap={3}
            alignItems="center"
            fontSize="sm"
          >
            <Box minW={0} truncate fontWeight="medium">
              {row.label}
            </Box>
            <Flex
              h="10px"
              borderRadius="full"
              bg="bg.muted"
              overflow="hidden"
              aria-hidden
            >
              {row.parts.map((part, index) => (
                <Box
                  key={index}
                  h="100%"
                  bg={part.color}
                  width={`${(part.value / max) * 100}%`}
                />
              ))}
            </Flex>
            <Text
              fontVariantNumeric="tabular-nums"
              fontWeight="semibold"
              textAlign="right"
              whiteSpace="nowrap"
            >
              {row.value ?? total.toLocaleString('en')}
            </Text>
          </Grid>
        );
        return (
          <Box as="li" key={row.key}>
            {row.to ? (
              <Box
                asChild
                display="block"
                borderRadius="md"
                _hover={{ bg: 'bg.muted' }}
                mx={-1}
                px={1}
              >
                <Link to={row.to}>{bar}</Link>
              </Box>
            ) : (
              bar
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const sum = (parts) => parts.reduce((total, part) => total + part.value, 0);

export default BarList;
