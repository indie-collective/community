import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Combobox, HStack, Text, createListCollection } from '@chakra-ui/react';
import { LuBuilding2, LuMapPin } from 'react-icons/lu';

import { RecordRow } from './RecordPicker';
import useDebounce from '../hooks/useDebounce';
import { geocodingUrl, placeFromFeature } from '../utils/geocoding';

const MAPBOX_TOKEN =
  'pk.eyJ1IjoiaW5kaWVjb2xsZSIsImEiOiJja21qN2dzd2kwb2d3MndxNGs4eGFyeXhnIn0.4kAFQx69wEpXRGPcsGE--Q';

const TYPE_LABELS = {
  country: 'Country',
  region: 'Region',
  place: 'City',
  address: 'Address',
  poi: 'Place',
};

// A venue as the field's value, in the shape a place has.
const venueValue = ({ location }) =>
  location && {
    street: location.street,
    city: location.city,
    region: location.region,
    countryCode: location.country_code,
    longitude: location.longitude,
    latitude: location.latitude,
  };

// Venues matching the text (#390), listed before Mapbox's places.
const searchVenues = async (q) => {
  const res = await fetch(`/search-venue?${new URLSearchParams({ q })}`);
  if (!res.ok) return [];
  return res.json();
};

// What a row says: a venue, or a city, region or address and where it is.
const describeVenue = (venue) => ({
  icon: <LuBuilding2 size={14} />,
  meta: ['Venue', venue.location?.street, venue.location?.city].filter(Boolean).join(' · '),
});
const describeFeature = (feature) => ({
  icon: <LuMapPin size={14} />,
  meta: [
    TYPE_LABELS[feature.place_type?.[0]] ?? 'Place',
    feature.place_name.split(', ').slice(1).join(', '),
  ]
    .filter(Boolean)
    .join(' · '),
});

/**
 * Where something is: venues on the site first (with `venues`, #390), then
 * Mapbox's cities and addresses, in the record picker's menu. The pick is a
 * row with Change, and its parts go with the form as hidden fields (street,
 * city, region, country_code, longitude, latitude).
 *
 * `value` is `{ label, value }`; `onChange` gets `{ label, value, venue?,
 * venueName? }`, `onClear` nothing.
 */
const PlaceField = ({
  onChange = () => {},
  onClear = () => {},
  onError = () => {},
  value = { label: '', value: null },
  venues = false,
  placeholder = 'Search for a place',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ venues: [], places: [] });
  const [hidden, setHidden] = useState({});
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    const q = debounced.trim();
    if (q.length < 3) {
      setResults({ venues: [], places: [] });
      return undefined;
    }
    let current = true;
    const types = venues
      ? ['country', 'region', 'place', 'address', 'poi']
      : ['country', 'region', 'place', 'address'];
    Promise.all([
      venues ? searchVenues(q).catch(() => []) : [],
      fetch(geocodingUrl(q, { token: MAPBOX_TOKEN, types }))
        .then((res) => {
          if (!res.ok) throw Error(res.statusText);
          return res.json();
        })
        .then((json) => json.features)
        .catch((error) => {
          onError(error);
          return [];
        }),
    ]).then(([foundVenues, places]) => {
      if (current) setResults({ venues: foundVenues, places });
    });
    return () => {
      current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onError is a callback
  }, [debounced, venues]);

  const items = useMemo(
    () => [
      ...results.venues.map((venue) => ({
        value: `venue:${venue.id}`,
        // Its whole address, read out as the option's name.
        label: [venue.name, venue.location?.street, venue.location?.city].filter(Boolean).join(', '),
        venue,
        group: 'Venues',
      })),
      ...results.places.map((feature) => ({
        value: feature.id,
        label: feature.place_name,
        feature,
        group: 'Places',
      })),
    ],
    [results]
  );
  const collection = useMemo(
    () =>
      createListCollection({
        items,
        itemToString: (item) => item.label,
        itemToValue: (item) => item.value,
      }),
    [items]
  );

  const pick = (item) => {
    if (item.venue) {
      const { venue } = item;
      setHidden({});
      onChange({
        label: [venue.name, venue.location?.street, venue.location?.city].filter(Boolean).join(', '),
        value: venueValue(venue),
        venue: { id: venue.id, name: venue.name },
      });
      return;
    }
    const { venueName, ...found } = placeFromFeature(item.feature);
    setHidden({
      street: found.street,
      city: found.city,
      region: found.region,
      country_code: found.countryCode,
      longitude: found.longitude,
      latitude: found.latitude,
    });
    onChange({
      label: item.feature.place_name,
      value: { ...found, bbox: item.feature.bbox },
      venueName,
    });
  };

  const fields = Object.entries(hidden).map(([key, v]) => (
    <input key={key} type="hidden" name={key} value={v ?? ''} />
  ));

  if (value?.label) {
    const [name, ...rest] = value.label.split(', ');
    return (
      <Box w="100%">
        {fields}
        <HStack
          justify="space-between"
          gap={3}
          p={2}
          pe={3}
          bg="surface"
          borderWidth="1px"
          borderColor="rule"
          rounded="card"
        >
          <RecordRow
            record={{ name }}
            describe={() => ({
              icon: value.venue ? <LuBuilding2 size={14} /> : <LuMapPin size={14} />,
              meta: [value.venue && 'Venue', rest.join(', ')].filter(Boolean).join(' · '),
            })}
          />
          <Button
            variant="plain"
            size="sm"
            textDecoration="underline"
            onClick={() => {
              setHidden({});
              setQuery('');
              onClear();
            }}
          >
            Change
          </Button>
        </HStack>
      </Box>
    );
  }

  const firstPlace = items.findIndex((item) => item.feature);
  return (
    <Combobox.Root
      collection={collection}
      // Uncontrolled text: controlling it while the list updates drops keys.
      onInputValueChange={(details) => setQuery(details.inputValue)}
      onValueChange={(details) => details.items[0] && pick(details.items[0])}
      inputBehavior="autohighlight"
      positioning={{ sameWidth: true, gutter: 4 }}
      // Inside a Field, the combobox takes the field's ids, so the field's
      // label names it.
      width="100%"
    >
      {fields}
      {/* Enter picks; it never submits the form around the field. */}
      <Combobox.Control onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}>
        <Combobox.Input
          placeholder={placeholder}
          borderRadius="control"
          borderWidth="2px"
          borderColor="brand"
        />
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content
          p={1}
          bg="surface"
          borderWidth="1px"
          borderColor="rule"
          rounded="card"
          shadow="lift"
        >
          <Combobox.Empty px={3} py={2} fontSize="sm" color="muted">
            {query.trim().length < 3 ? 'Type a few letters' : 'Nothing found'}
          </Combobox.Empty>
          {collection.items.map((item, index) => (
            <Box key={item.value}>
              {(index === 0 || index === firstPlace) && (
                <>
                  {index > 0 && <Box borderTopWidth="1px" borderColor="rule" my={1} />}
                  {venues && (
                    <Text fontSize="xs" color="muted" px={3} pt={1.5} pb={1}>
                      {item.group}
                    </Text>
                  )}
                </>
              )}
              <Combobox.Item
                item={item}
                aria-label={item.label}
                px={3}
                py={2}
                rounded="control"
                _highlighted={{ bg: 'canvas' }}
              >
                {item.venue ? (
                  <RecordRow record={item.venue} describe={describeVenue} />
                ) : (
                  <RecordRow record={{ name: item.feature.text }} describe={() => describeFeature(item.feature)} />
                )}
              </Combobox.Item>
            </Box>
          ))}
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
};

export default PlaceField;
