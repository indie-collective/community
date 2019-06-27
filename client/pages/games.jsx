import React from 'react';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import detailedGames from '../gql/detailedGames';
import DebugTable from '../components/DebugTable';
import Spinner from '../components/Spinner';

const Home = () => {
  const games = useQuery({
    query: detailedGames,
  })[0];

  return (
    <div>
      {games.data ? games.data.allGames.nodes.map(game => (
        <div className="card" style={{ width: 240, display: 'inline-block', margin: 10 }}>
          <div className="card-content">
            <p className="title">
              <A href={`/game/${game.id}`}>{game.name}</A>
            </p>
            <p>
              {game.about}
            </p>
          </div>
          <footer className="card-footer">
            <p className="card-footer-item">
              <span>
                <a href={game.site}>Site</a>
              </span>
            </p>
          </footer>
        </div>
      )) : (
        <Spinner />
      )}

      <DebugTable
        keys={['name', 'about', 'site']}
        data={games.data ? games.data.allGames.nodes : []}
      />
    </div>
  );
};

export default Home;
