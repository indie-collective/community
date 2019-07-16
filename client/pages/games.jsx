import React from 'react';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import detailedGames from '../gql/detailedGames';
import Spinner from '../components/Spinner';
import Masonry from '../components/Masonry';

const Home = () => {
  const games = useQuery({
    query: detailedGames,
  })[0];

  console.log(games);

  return (
    <div style={{ padding: 15 }}>
      {!games.data ? (
        <Spinner />
      ) : (
        <Masonry>
          {games.data.allGames.nodes.map(game => (
            <div className="card">
              <div className="card-content">
                <p className="title">
                  <A href={`/game/${game.id}`}>{game.name}</A>
                </p>
                <p>{game.about}</p>
              </div>
              <footer className="card-footer">
                <p className="card-footer-item">
                  <span>
                    <a href={game.site}>Site</a>
                  </span>
                </p>
              </footer>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
};

export default Home;
