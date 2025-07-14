import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';

import SelectInput from './SelectInput';
import useDebounce from '../hooks/useDebounce';

const defaultProps = {
  defaultQuery: '',
  types: null,

  inputId: null,
  inputOnFocus: null,
  inputOnBlur: null,
  inputOnClick: null,
};

const propTypes = {
  onSuggestionSelect: PropTypes.func.isRequired,
  defaultQuery: PropTypes.string,
  types: PropTypes.arrayOf(
    PropTypes.oneOf([
      'country',
      'region',
      'postcode',
      'district',
      'place',
      'locality',
      'neighborhood',
      'address',
      'poi',
    ])
  ),

  inputId: PropTypes.string,
  inputOnFocus: PropTypes.func,
  inputOnBlur: PropTypes.func,
  inputOnClick: PropTypes.func,
  inputClass: PropTypes.string,
  placeholder: PropTypes.string,
  resetSearch: PropTypes.bool,
};

const PhotonAutocomplete = ({
  onSuggestionSelect,
  defaultQuery,
  types,
  placeholder,
  inputProps,
}) => {
  const [isFirstQuery, setIsFirstQuery] = useState(!!defaultQuery);
  const [query, setQuery] = useState(defaultQuery);
  const [queryResults, setQueryResults] = useState([]);
  const [value, setValue] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  useEffect(async () => {
    const header = { 'Content-Type': 'application/json' };
    let path = `https://photon.komoot.io/api/?q=${query}&lang=default`;

    if (types && types.length > 0) {
      path += `&osm_tag=place:${types.join('&osm_tag=place:')}`;
    }

    if (query.length > 2) {
      try {
        setIsLoading(true);
        const res = await fetch(path, { headers: header });

        if (!res.ok) throw Error(res.statusText);
        const json = await res.json();

        setIsLoading(false);
        setError(false);
        setQueryResults(json.features);

        if (isFirstQuery) {
          setValue(json.features[0]);
          setIsFirstQuery(false);
        }
      } catch (err) {
        setIsLoading(false);
        setError(true);
        setErrorMsg('There was a problem retrieving data from mapbox');
        setQueryResults([]);
      }
    } else {
      setIsLoading(false);
      setError(false);
      setQueryResults([]);
    }
  }, [debouncedQuery]);

  return (
    <SelectInput
      placeholder={placeholder || 'Search location'}
      name="location"
      items={queryResults}
      itemPredicate={(item) => {
        let { name, street, city, state: region, country } = item.properties;

        switch (item.properties.type) {
          case 'state':
            region = name;
            return `${region}, ${country}`;
          case 'city':
            city = name;
            return `${city}, ${region}, ${country}`;
          case 'street':
            street = name;
            return `${street}, ${city}, ${region}, ${country}`;
          default:
            return name;
        }
      }}
      icon={<FiSearch />}
      onSelect={(value) => {
        setValue(value);
        onSuggestionSelect(value);
      }}
      onInputChange={setQuery}
      inputProps={inputProps}
      value={value}
    />
  );
};

PhotonAutocomplete.defaultProps = defaultProps;
PhotonAutocomplete.propTypes = propTypes;

export default PhotonAutocomplete;
