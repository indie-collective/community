import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'urql';
import { A } from 'hookrouter';
import { motion } from 'framer-motion';

import Spinner from '../components/Spinner';

import eventQuery from '../gql/eventById';

const propTypes = {
  id: PropTypes.string.isRequired,
};

const Event = ({ id }) => {
  const res = useQuery({ query: eventQuery, variables: { id } })[0];

  if (!res.data) {
    return <Spinner />;
  }

  const {
    name,
    about,
    site,
    startsAt,
    endsAt,
    location,
    entities,
    games,
  } = res.data.event;

  return (
    <section>
      <motion.section
        className="hero is-warning"
        style={{ borderRadius: 4, marginTop: 15 }}
        variants={{
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
          },
        }}
        initial="hidden"
        animate="visible"
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <div className="hero-body">
          <div className="container">
            <h1 className="title">{name}</h1>
            <h2 className="subtitle">{about}</h2>
          </div>
        </div>
      </motion.section>

      <pre>When {JSON.stringify({ startsAt, endsAt }, false, 2)}</pre>
      <pre>Where {JSON.stringify(location, false, 2)}</pre>
      <pre>Entities {JSON.stringify(entities, false, 2)}</pre>
      <pre>Games {JSON.stringify(games, false, 2)}</pre>
    </section>
  );
};

Event.propTypes = propTypes;

export default Event;
