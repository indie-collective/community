import React from 'react';
import PropTypes from 'prop-types';

import MapboxAutocomplete from './MapboxAutocomplete';

const propTypes = {
  onChange: PropTypes.func,
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

const defaultProps = {
  onChange: () => {},
  value: { label: '', value: null },
};

const PlacesSearch = ({ onChange, onClear, options, value, ...rest }) => {
  const l = value.value;

  return (
    <MapboxAutocomplete
      defaultQuery={value.label}
      token="pk.eyJ1IjoiaW5kaWVjb2xsZSIsImEiOiJja21qN2dzd2kwb2d3MndxNGs4eGFyeXhnIn0.4kAFQx69wEpXRGPcsGE--Q"
      types={[/*'country',*/ 'region', 'place', 'address' /*, 'poi'*/]}
      onSuggestionSelect={(place) => {
        if (!place) return onClear();

        let countryCode, region, city, street;

        if (place.place_type.includes('country'))
          countryCode = place.short_code;
        else {
          countryCode = place.context.find((c) => c.id.includes('country'))
            .short_code;

          if (place.place_type.includes('region')) region = place.text;
          else {
            region = place.context.find((c) => c.id.includes('region')).text;

            if (place.place_type.includes('place')) city = place.text;
            else {
              city = place.context.find((c) => c.id.includes('place')).text;

              if (place.place_type.includes('address')) {
                if (place.address) street = place.address + ' ' + place.text;
                else street = place.text;
              } else {
                const address = place.context.find((c) =>
                  c.id.includes('address')
                );

                if (address.address) street = address.address + ' ' + address.text;
                else street = address.text;
              }
            }
          }
        }

        onChange({
          label: place.place_name,
          value: {
            street,
            city,
            region,
            countryCode: countryCode.toUpperCase(),
            longitude: place.geometry.coordinates[0],
            latitude: place.geometry.coordinates[1],
            bbox: place.bbox,
          },
        });
      }}
      {...rest}
    />
  );
};

PlacesSearch.propTypes = propTypes;
PlacesSearch.defaultProps = defaultProps;

export default PlacesSearch;
