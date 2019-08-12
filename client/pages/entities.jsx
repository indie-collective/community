import React from 'react';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import eventsQuery from '../gql/entities';
import Spinner from '../components/Spinner';

const Entities = () => {
  const res = useQuery({
    query: eventsQuery,
  })[0];

  return (
    <div>
      <section className="hero is-info is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Entities
            </h1>
            <h2 className="subtitle">
              There are currently {res.data ? res.data.entities.totalCount : '?'} entities registered.
            </h2>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1.5em' }}>
        {!res.data ? (
          <Spinner />
        ) : (
          res.data.entities.nodes.map(entity => (
            <div key={entity.id} className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="title is-5">
                    <A href={`/entity/${entity.id}`}>{entity.name}</A>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>  );
};

export default Entities;
