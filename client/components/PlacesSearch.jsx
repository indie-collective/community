import React from 'react';
import AlgoliaPlaces from './AlgoliaPlaces';
import { Input } from '@chakra-ui/core';

const propTypes = {
  ...AlgoliaPlaces.propTypes,
  options: {
    ...AlgoliaPlaces.propTypes.options,
    appId: undefined,
    apiKey: undefined,
  },
};

const defaultProps = {
  ...AlgoliaPlaces.defaultProps,
  placeholder: "Write an address here",
};

const PlacesSearch = ({ options, value, ...rest }) => {

  return (
    <>
      <style jsx global>{`
        /* sounds like the reset file makes all SVG block, messing with Algolia's style */
        .ap-suggestion svg, .ap-footer svg {
          display: inline;
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
        {...rest}
      />
    </>
  );
};

PlacesSearch.propTypes = propTypes;
PlacesSearch.defaultProps = defaultProps;

export default PlacesSearch;
