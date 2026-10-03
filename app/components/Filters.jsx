import { Box, NativeSelect, Checkbox, Wrap } from '@chakra-ui/react';

import { Form, useSubmit } from 'react-router';
import CountryCombobox from './CountryCombobox';

const Filters = ({ facets, selected, type }) => {
  const submit = useSubmit();

  const handleChange = (event) => {
    submit(event.currentTarget.form);
  };

  return (
    <Box method="get" mb={5} asChild>
      <Form>
        <Wrap gap={4}>
          <CountryCombobox
            countries={facets.countries}
            defaultValue={selected.country}
            onChange={(form) => submit(form)}
          />

          {type === 'event' ? (
            <NativeSelect.Root>
              <NativeSelect.Field
                name="period"
                defaultValue={selected.period || 'upcoming'}
                onChange={handleChange}
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
                colorPalette="green"
              >
                {/* The native input's change event carries its form. */}
                <Checkbox.HiddenInput onChange={handleChange} />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>Has published games</Checkbox.Label>
              </Checkbox.Root>

              <Checkbox.Root
                name="has_events"
                value="on"
                defaultChecked={selected.has_events === 'on'}
                colorPalette="green"
              >
                <Checkbox.HiddenInput onChange={handleChange} />
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
