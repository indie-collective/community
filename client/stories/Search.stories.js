import React, { useState } from 'react';

import Search from '../components/Search';

export default {
  title: 'Components/Search',
  component: Search,
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve()
    }, ms)
  })
}

const Template = (args) => {
  const [results, setResults] = useState();
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    await wait(500);
    setResults([{ label: 'test', link: '/' }]);
    setLoading(false);
  }

  return (
    <Search
      results={results}
      loading={loading}
      onSearch={handleSearch}
    />
  );
};

export const Example = Template.bind({});
Example.args = {
  results: [],
  onSearch() {},
};
