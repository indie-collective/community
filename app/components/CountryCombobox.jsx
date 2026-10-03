import { useMemo, useRef } from 'react';
import { Combobox, Portal, useFilter, useListCollection } from '@chakra-ui/react';

import countryNames from '../assets/countries.json';

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

/**
 * A searchable country picker for list filters (#205): type to narrow the
 * countries, which show their flag and count. It submits its form through a
 * hidden `name` input, like the native select it replaced, so `?country=`
 * keeps working; clearing it drops the parameter.
 */
const CountryCombobox = ({ countries, name = 'country', defaultValue, onChange }) => {
  const inputRef = useRef();
  const items = useMemo(
    () =>
      countries.map(({ country_code, _count }) => ({
        value: country_code,
        label: `${getFlagEmoji(country_code)} ${countryNames[country_code] || country_code} (${_count})`,
      })),
    [countries]
  );

  const { contains } = useFilter({ sensitivity: 'base' });
  const { collection, filter } = useListCollection({ initialItems: items, filter: contains });

  return (
    <Combobox.Root
      collection={collection}
      defaultValue={defaultValue ? [defaultValue] : []}
      onInputValueChange={(details) => filter(details.inputValue)}
      onValueChange={(details) => {
        const input = inputRef.current;
        input.value = details.value[0] ?? '';
        // An empty value isn't submitted, so clearing removes ?country=.
        input.disabled = !input.value;
        onChange?.(input.form);
      }}
      openOnClick
      size="sm"
      width="240px"
    >
      <Combobox.Label srOnly>Country</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="All countries" borderRadius="md" />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger aria-label="Clear country" />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue ?? ''} disabled={!defaultValue} />
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No country found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.value}>
                {item.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};

export default CountryCombobox;
