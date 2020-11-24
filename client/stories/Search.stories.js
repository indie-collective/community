import React, { useState } from 'react';
import games from './sample_games.json';

import Search from '../components/Search';

export default {
  title: 'Components/Search',
  component: Search,
};

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, ms);
  });
}

const Template = () => {
  const [results, setResults] = useState();
  const [loading, setLoading] = useState(false);

  async function handleSearch(query) {
    setLoading(true);
    await wait(500);
    setResults(
      games
        .filter((game) =>
          game.name.toLowerCase().startsWith(query.toLowerCase())
        )
        .slice(0, 10)
    );
    setLoading(false);
  }

  return (
    <Search
      loading={loading}
      results={results}
      renderResult={(game) => game.name}
      itemToString={game => game.name}
      onSearch={handleSearch}
      onSelect={alert}
    />
  );
};

export const Example = Template.bind({});
Example.args = {};
