import { NativeSelect, Checkbox, Tag } from '@chakra-ui/react';

import { Form, useNavigate, useSearchParams, useSubmit } from 'react-router';
import CountryCombobox from './CountryCombobox';
import { FilterBar } from './Page';

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
          ) : type === 'publisher' ? (
            // #331: publishers of games like yours.
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field
                name="tag"
                aria-label="Published games tagged"
                defaultValue={selected.tag ?? ''}
                onChange={handleChange}
                borderRadius="md"
                width="auto"
              >
                <option value="">Any kind of game</option>
                {facets.tags?.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name} ({tag._count})
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
