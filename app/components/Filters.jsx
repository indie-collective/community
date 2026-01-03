import {
  Box,
  Select,
  Checkbox,
  Flex,
} from '@chakra-ui/react';

import { Form, useSubmit } from '@remix-run/react';
import countryNames from '../assets/countries.json';

const Filters = ({ facets, selected }) => {
  const submit = useSubmit();

  const handleChange = (event) => {
    submit(event.currentTarget.form);
  };

  return (
    <Box
      as={Form}
      method="get"
      mb={5}
    >
      <Flex gap={4} align="center" wrap="wrap">
        <Select
          name="country"
          placeholder="All countries"
          defaultValue={selected.country}
          onChange={handleChange}
          borderRadius="md"
          width="auto"
        >
          {facets.countries.map(({ country_code, _count }) => (
            <option key={country_code} value={country_code}>
              {countryNames[country_code] || country_code} ({_count})
            </option>
          ))}
        </Select>

        <Checkbox
          name="has_games"
          value="on"
          defaultIsChecked={selected.has_games === 'on'}
          onChange={handleChange}
          colorScheme="green"
        >
          Has published games
        </Checkbox>

        <Checkbox
          name="has_events"
          value="on"
          defaultIsChecked={selected.has_events === 'on'}
          onChange={handleChange}
          colorScheme="green"
        >
          Has hosted events
        </Checkbox>
      </Flex>
    </Box>
  );
};

export default Filters;
