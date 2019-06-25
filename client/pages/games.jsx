import React from 'react';
import { useQuery } from 'urql';

import detailedGames from '../gql/detailedGames';
import DebugTable from '../components/DebugTable';

const Home = () => {
  const allGames = useQuery({
    query: detailedGames,
  })[0];

  return (
    <div>
      <DebugTable
        keys={['name', 'about', 'site']}
        data={allGames.data ? allGames.data.allGames.nodes : []}
      />
    </div>
  );
};

export default Home;
