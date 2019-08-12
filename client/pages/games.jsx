import React from 'react';
import { useQuery } from 'urql';
import { A, useQueryParams, navigate } from 'hookrouter';

import detailedGames from '../gql/detailedGames';
import Spinner from '../components/Spinner';

const Home = () => {
  const [queryParams, setQueryParams] = useQueryParams();
  console.log(queryParams);

  let tags = queryParams.tags ? queryParams.tags.split(',') : [];

  const res = useQuery({
    query: detailedGames,
    variables: { tags },
  })[0];

  return (
    <div>
      <section className="hero is-success is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Games</h1>
            <h2 className="subtitle">
              Showing {res.data ? res.data.games.totalCount : '?'} games
              registered.
            </h2>
            <div className="tags">
              {tags.map(tag => (
                <div className="tag is-medium">
                  <span style={{ textTransform: 'capitalize' }}>{tag}</span>
                  <button
                    className="delete is-small"
                    onClick={() => {
                      setQueryParams({
                        tags: tags.filter(name => name !== tag).join(','),
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1.5em' }}>
        {!res.data ? (
          <Spinner />
        ) : (
          res.data.games.nodes.map(game => (
            <div key={game.id} className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="title is-5">
                    <A href={`/game/${game.id}`}>{game.name}</A>
                  </div>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <div className="tags" style={{ textTransform: 'capitalize' }}>
                    {game.tags.nodes.map(tag => (
                      <A
                        key={tag.id}
                        className="tag is-light"
                        href={`/games?tags=${Array.from(
                          new Set([...tags, tag.name])
                        ).join(',')}`}
                        onClick={() => {
                          setQueryParams({
                            tags: Array.from(new Set([...tags, tag.name])).join(','),
                          });
                        }}
                      >
                        {tag.name}
                      </A>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Home;
