import { Button, Checkbox, HStack, NativeSelect, Tag, Text } from '@chakra-ui/react';

import { Form, useNavigate, useSearchParams, useSubmit } from 'react-router';
import CountryCombobox from './CountryCombobox';
import { FilterBar } from './Page';
import countryNames from '../assets/countries.json';

const Filters = ({ facets, selected, type }) => {
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lists filtered to a city (from a country page, #258) keep the city
  // across the other filters, until it's removed or the country changes.
  const withoutCity = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('city');
    return `?${next}`;
  };

  // One click to a top country (design pass), or back to all of them.
  const withCountry = (code) => {
    const next = new URLSearchParams(searchParams);
    next.delete('city');
    next.delete('page');
    if (selected.country === code) next.delete('country');
    else next.set('country', code);
    return `?${next}`;
  };

  const handleChange = (event) => {
    submit(event.currentTarget.form);
  };

  return (
    <Form method="get">
      <FilterBar>
          <CountryCombobox
            countries={facets.countries}
            defaultValue={selected.country}
            onChange={(form) => {
              form.querySelector('input[name="city"]')?.remove();
              submit(form);
            }}
          />

          <HStack gap={1} wrap="wrap" role="group" aria-label="Top countries">
            {facets.countries.slice(0, 6).map(({ country_code: code, _count }) => {
              const on = selected.country === code;
              return (
                <Button
                  key={code}
                  type="button"
                  size="xs"
                  variant={on ? 'solid' : 'outline'}
                  colorPalette={on ? 'green' : 'gray'}
                  aria-pressed={on}
                  title={countryNames[code]}
                  onClick={() => navigate(withCountry(code))}
                >
                  {code}
                  <Text as="span" fontWeight="normal" opacity={0.75}>
                    {_count}
                  </Text>
                </Button>
              );
            })}
          </HStack>

          {selected.city && (
            <>
              <input type="hidden" name="city" value={selected.city} />
              <Tag.Root
                size="lg"
                variant="subtle"
                colorPalette="green"
                alignSelf="center"
              >
                <Tag.Label>In {selected.city}</Tag.Label>
                <Tag.EndElement>
                  <Tag.CloseTrigger
                    // Inside the form: a submit button would send the city again.
                    type="button"
                    aria-label="Show every city"
                    onClick={() => navigate(withoutCity())}
                  />
                </Tag.EndElement>
              </Tag.Root>
            </>
          )}

          {type === 'event' ? (
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field
                name="period"
                aria-label="When"
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
      </FilterBar>
    </Form>
  );
};

export default Filters;
