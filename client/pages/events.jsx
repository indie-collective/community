import React from 'react';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import eventsQuery from '../gql/events';
import Spinner from '../components/Spinner';

const Events = () => {
  const res = useQuery({
    query: eventsQuery,
  })[0];

  return (
    <div>
      <section className="hero is-warning is-bold">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Events
            </h1>
            <h2 className="subtitle">
              There are currently {res.data ? res.data.events.totalCount : '?'} events registered.
            </h2>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1.5em' }}>
        {!res.data ? (
          <Spinner />
        ) : (
          res.data.events.nodes.map(event => (
            <div key={event.id} className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="title is-5">
                    <A href={`/event/${event.id}`}>{event.name}</A>
                  </div>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <div>{event.startsAt} - {event.endsAt}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default Events;
