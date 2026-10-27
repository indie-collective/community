import { Button, NativeSelect, Checkbox, Tag } from '@chakra-ui/react';
import { useState } from 'react';
import { LuLocateFixed } from 'react-icons/lu';

import { Form, useNavigate, useSearchParams, useSubmit } from 'react-router';
import CountryCombobox from './CountryCombobox';
import { FilterBar } from './Page';

// Radii for "near me" on the events list (#347), in km.
export const NEAR_RADII = [25, 50, 100, 250];

/**
 * Events near the visitor (#347): asks the browser for its location only
 * when clicked, then keeps it in the URL (`near=lat,lng`, `km`).
 */
const NearMe = ({ selected, onChange, without }) => {
  const navigate = useNavigate();
  const [state, setState] = useState('idle');
  if (selected.near) {
    return (
      <>
        <input type="hidden" name="near" value={selected.near} />
        <NativeSelect.Root size="sm" width="auto">
          <NativeSelect.Field
            name="km"
            aria-label="Distance"
            defaultValue={selected.km}
            onChange={onChange}
            borderRadius="md"
            width="auto"
          >
            {NEAR_RADII.map((km) => (
              <option key={km} value={km}>
                Within {km} km
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Tag.Root
          size="lg"
          variant="subtle"
          colorPalette="green"
          alignSelf="center"
        >
          <Tag.Label>Near you</Tag.Label>
          <Tag.EndElement>
            <Tag.CloseTrigger
              type="button"
              aria-label="Show events anywhere"
              onClick={() => navigate(without('near', 'km'))}
            />
          </Tag.EndElement>
        </Tag.Root>
      </>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      loading={state === 'locating'}
      onClick={(event) => {
        const form = event.currentTarget.form;
        if (!navigator.geolocation) return setState('unavailable');
        setState('locating');
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const params = new URLSearchParams(new FormData(form));
            params.set(
              'near',
              `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`
            );
            params.set('km', '50');
            navigate(`?${params}`);
          },
          () => setState('unavailable'),
          { timeout: 10000 }
        );
      }}
    >
      <LuLocateFixed />
      {state === 'unavailable' ? 'Location unavailable' : 'Near me'}
    </Button>
  );
};

const Filters = ({ facets, selected, type }) => {
  const submit = useSubmit();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lists filtered to a city (from a country page, #258) keep the city
  // across the other filters, until it's removed or the country changes.
  const without = (...names) => {
    const next = new URLSearchParams(searchParams);
    for (const name of names) next.delete(name);
    return `?${next}`;
  };
  const withoutCity = () => without('city');

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
          <>
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
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field
                name="where"
                aria-label="Where"
                defaultValue={selected.where ?? ''}
                onChange={handleChange}
                borderRadius="md"
                width="auto"
              >
                <option value="">In person or online</option>
                <option value="in_person">In person</option>
                <option value="online">Online</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NearMe
              selected={selected}
              onChange={handleChange}
              without={without}
            />
          </>
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
