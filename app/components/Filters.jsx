import { Box, NativeSelect, Checkbox, Flex, Stack, HStack, Wrap } from '@chakra-ui/react';

import { Form, useSubmit } from 'react-router';
import countryNames from '../assets/countries.json';

function getFlagEmoji(countryCode) {
  let codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const Filters = ({ facets, selected, type }) => {
  const submit = useSubmit();

  const handleChange = (event) => {
    submit(event.currentTarget.form);
  };

  return (
    <Box method="get" mb={5} asChild>
      <Form>
        <Wrap gap={4}>
          <NativeSelect.Root size="sm" width="240px">
            <NativeSelect.Field
              name="country"
              placeholder="All countries"
              defaultValue={selected.country}
              onValueChange={handleChange}
              borderRadius="md"
              width="auto"
            >
              {facets.countries.map(({ country_code, _count }) => (
                <option key={country_code} value={country_code}>
                  {getFlagEmoji(country_code)}{' '}
                  {countryNames[country_code] || country_code} ({_count})
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          {type === 'event' ? (
            <NativeSelect.Root>
              <NativeSelect.Field
                name="period"
                value={selected.period || 'upcoming'}
                onValueChange={handleChange}
                borderRadius="md"
                width="auto"
              >
                <option value="upcoming">Upcoming</option>
                {facets.years?.map(({ year }) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          ) : (
            <>
              <Checkbox.Root
                name="has_games"
                value="on"
                defaultChecked={selected.has_games === 'on'}
                onCheckedChange={handleChange}
                colorPalette="green"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>Has published games</Checkbox.Label>
              </Checkbox.Root>

              <Checkbox.Root
                name="has_events"
                value="on"
                defaultChecked={selected.has_events === 'on'}
                onCheckedChange={handleChange}
                colorPalette="green"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>Has hosted events</Checkbox.Label>
              </Checkbox.Root>
            </>
          )}
        </Wrap>
      </Form>
    </Box>
  );
};

export default Filters;
