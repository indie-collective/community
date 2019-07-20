import React from 'react';
import renderer from 'react-test-renderer';

import SearchBar from '.';

it('renders correctly', () => {
  const tree = renderer
    .create(
      <SearchBar
        results={[]}
        loading
        onSearch={() => null}
        onSelect={console.log}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
