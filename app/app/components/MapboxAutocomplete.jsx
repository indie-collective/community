import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Spinner } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

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
  token: PropTypes.string.isRequired,
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

const MapboxAutocomplete = ({
  token,
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

  useEffect(() => {
    async function getLocation() {
      const header = { 'Content-Type': 'application/json' };
      let path = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&autocomplete=true`;
  
      if (types) {
        path += `&types=${types.join(',')}`;
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
    }

    getLocation();
  }, [debouncedQuery]);

  return (
    <SelectInput
      placeholder={placeholder || 'Search location'}
      name="location"
      items={queryResults}
      itemPredicate={(item) => item.place_name}
      icon={isLoading ? <Spinner size="sm" /> : <SearchIcon />}
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

MapboxAutocomplete.defaultProps = defaultProps;
MapboxAutocomplete.propTypes = propTypes;

export default MapboxAutocomplete;
