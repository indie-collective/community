import React from 'react';
import PropTypes from 'prop-types';
import { Input, useColorMode, useTheme } from '@chakra-ui/react';

import AlgoliaPlaces from './AlgoliaPlaces';

const propTypes = {
  ...AlgoliaPlaces.propTypes,
  options: PropTypes.shape({
    ...AlgoliaPlaces.propTypes.options,
    isRequired: undefined,
    appId: undefined,
    apiKey: undefined,
  }),
};

const defaultProps = {
  ...AlgoliaPlaces.defaultProps,
  placeholder: "Write an address here",
  options: {},
};

const PlacesSearch = ({ onChange, options, value, ...rest }) => {
  const {colorMode} = useColorMode();
  const theme = useTheme();

  const l = value.value;

  return (
    <>
      <style jsx global>{`
        /* sounds like the reset file makes all SVG block, messing with Algolia's style */
        .ap-suggestion svg, .ap-footer svg {
          display: inline;
        }

        .ap-dropdown-menu {
          background-color: ${colorMode === 'dark' ? theme.colors.gray[700] : ''};
        }

        .ap-cursor {
          background-color: ${colorMode === 'dark' ? theme.colors.gray[600] : ''};
        }
      `}</style>
      <AlgoliaPlaces
        as={Input}
        options={{
          appId: 'pl24HLO3LZ8C',
          apiKey: 'd578bc1dce14bf17d571df4e5b6a5a03',
          language: 'en',
          ...options,
        }}
        defaultValue={value.label}
        onChange={({ suggestion }) => {
          const {value, name, city, administrative, countryCode, latlng} = suggestion;

          if (suggestion.type === 'city') {
            onChange({
              label: value,
              value: {
                id: null,
                city: suggestion.name,
                region: administrative,
                countryCode: countryCode.toUpperCase(),
                latitude: latlng.lat,
                longitude: latlng.lng,
              },
            });
            return;
          }

          onChange({
            label: value,
            value: {
              id: null,
              street: name,
              city,
              region: administrative,
              countryCode: countryCode.toUpperCase(),
              latitude: latlng.lat,
              longitude: latlng.lng,
            },
          });
        }}
        {...rest}
      />
    </>
  );
};

PlacesSearch.propTypes = propTypes;
PlacesSearch.defaultProps = defaultProps;

export default PlacesSearch;
