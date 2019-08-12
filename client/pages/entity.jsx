import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'urql';
import { A } from 'hookrouter';
import { motion } from 'framer-motion';

import Spinner from '../components/Spinner';

import entityQuery from '../gql/entityById';

const propTypes = {
  id: PropTypes.string.isRequired,
};

const Entity = ({ id }) => {
  const res = useQuery({ query: entityQuery, variables: { id } })[0];

  if (!res.data) {
    return <Spinner />;
  }

  const {
    type,
    name,
    about,
    location,
    people,
    games,
    events,
  } = res.data.entity;

  return (
    <section>
      <motion.section
        className="hero is-info"
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

      <pre>Where {JSON.stringify(location, false, 2)}</pre>
      <pre>People {JSON.stringify(people, false, 2)}</pre>
      <pre>Games {JSON.stringify(games, false, 2)}</pre>
      <pre>When {JSON.stringify(events, false, 2)}</pre>
    </section>
  );
};

Entity.propTypes = propTypes;

export default Entity;
