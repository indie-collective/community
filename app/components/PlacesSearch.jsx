import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { LuMapPin } from 'react-icons/lu';

import MapboxAutocomplete from './MapboxAutocomplete';
import { placeFromFeature } from '../utils/geocoding';

const propTypes = {
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  onError: PropTypes.func,
  value: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
      countryCode: PropTypes.string,
      longitude: PropTypes.number,
      latitude: PropTypes.number,
    }),
  }),
};


// A venue as the picker's value, in the shape a place has.
const venueValue = ({ location }) =>
  location && {
    street: location.street,
    city: location.city,
    region: location.region,
    countryCode: location.country_code,
    longitude: location.longitude,
    latitude: location.latitude,
  };

// Venues matching the text (#390), as suggestions above Mapbox's.
const searchVenues = async (q) => {
  const res = await fetch(`/search-venue?${new URLSearchParams({ q })}`);
  if (!res.ok) return [];
  const venues = await res.json();
  return venues.map((venue) => ({
    venue,
    place_name: [venue.name, venue.location?.street, venue.location?.city, venue.location?.country_code]
      .filter(Boolean)
      .join(', '),
  }));
};

// Defaults as parameters: React 19 ignores defaultProps on function components.
const PlacesSearch = ({
  onChange = () => {},
  onClear = () => {},
  onError = () => {},
  options,
  value = { label: '', value: null },
  // Also find venues and places of interest by name (#390).
  venues = false,
  ...rest
}) => {
  const [hiddenValues, setHiddenValues] = useState({});

  return (
    <>
      {Object.entries(hiddenValues).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <MapboxAutocomplete
        defaultQuery={value.label}
        token="pk.eyJ1IjoiaW5kaWVjb2xsZSIsImEiOiJja21qN2dzd2kwb2d3MndxNGs4eGFyeXhnIn0.4kAFQx69wEpXRGPcsGE--Q"
        types={
          venues
            ? ['country', 'region', 'place', 'address', 'poi']
            : ['country', 'region', 'place', 'address']
        }
        searchExtra={venues ? searchVenues : undefined}
        onSuggestionSelect={(place) => {
          if (!place) {
            setHiddenValues({});
            return onClear();
          }

          // A venue brings its own place: the server reads it from there.
          if (place.venue) {
            setHiddenValues({});
            return onChange({
              label: place.place_name,
              value: venueValue(place.venue),
              venue: { id: place.venue.id, name: place.venue.name },
            });
          }

          const { venueName, ...found } = placeFromFeature(place);

          setHiddenValues({
            street: found.street,
            city: found.city,
            region: found.region,
            country_code: found.countryCode,
            longitude: found.longitude,
            latitude: found.latitude,
          });

          onChange({
            label: place.place_name,
            value: { ...found, bbox: place.bbox },
            venueName,
          });
        }}
        onError={onError}
        inputProps={{ leftIcon: <LuMapPin /> }}
        {...rest}
      />
    </>
  );
};

PlacesSearch.propTypes = propTypes;

export default PlacesSearch;
