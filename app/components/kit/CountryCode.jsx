import { Box } from '@chakra-ui/react';

import countryNames from '../../assets/countries.json';

/** A country as its two-letter code, its name for pointer and screen readers. */
const CountryCode = ({ code, ...rest }) =>
  code ? (
    <Box
      as="abbr"
      title={countryNames[code] ?? code}
      textDecoration="none"
      fontSize="xs"
      fontWeight="semibold"
      letterSpacing="wide"
      color="muted"
      borderWidth="1px"
      borderRadius="sm"
      px="5px"
      lineHeight="1.6"
      whiteSpace="nowrap"
      {...rest}
    >
      {code}
    </Box>
  ) : null;

export default CountryCode;
