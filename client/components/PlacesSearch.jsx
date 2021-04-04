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

        place.place_type.map(type => {
          switch (type) {
            case 'country': countryCode = place.short_code; break;
            case 'region': region = place.text; break;
            case 'place': city = place.text; break;
            case 'address':
              if (place.address) street = place.address + ' ' + place.text;
              else street = place.text;
            break;
            default: break;
          }
        });

        place.context.map(context => {
          if (context.id.includes('country')) countryCode = context.short_code;

          if (context.id.includes('region')) region = context.text;

          if (context.id.includes('place')) city = context.text;

          if (context.id.includes('address')) {
            if (address.address) street = address.address + ' ' + address.text;
            else street = address.text;
          }
        });

        onChange({
          label: place.place_name,
          value: {
            street,
            city,
            region: region || city,
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
