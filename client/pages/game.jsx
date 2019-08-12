import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'urql';
import { A } from 'hookrouter';
import { motion } from 'framer-motion';

import Spinner from '../components/Spinner';

import gameQuery from '../gql/gameById';

const propTypes = {
  id: PropTypes.string.isRequired,
};

const Game = ({ id }) => {
  const res = useQuery({ query: gameQuery, variables: { id } })[0];

  const [dialogVisible, setDialogVisible] = useState(false);

  if (!res.data) {
    return <Spinner />;
  }

  const {
    name,
    about,
    site,
    createdAt,
    people,
    entities,
    images,
    tags,
    events,
  } = res.data.game;

  return (
    <section>
      <motion.section
        className="hero is-success"
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

            <div className="tags" style={{ textTransform: 'capitalize' }}>
              {tags.nodes.map(tag => (
                <A key={tag.id} className="tag is-link" href={`/tag/${tag.id}`}>
                  {tag.name}
                </A>
              ))}
            </div>

            <div className="tags has-addons">
              <span className="tag">Website</span>
              <a className="tag is-link" href={site} target="_blank">
                {site}
              </a>
            </div>
          </div>
        </div>
      </motion.section>

      <section
        className="tile is-parent is-horizontal"
        style={{
          marginTop: 5,
          display: 'grid',
          gap: 15,
          gridAutoFlow: 'column',
        }}
      >
        <motion.article
          className="tile is-child notification is-info"
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
          whileHover={{
            scale: 1.05,
            boxShadow: '2px 1px 10px rgba(0, 0, 0, 0.2)',
          }}
          whileTap={{ scale: 1 }}
        >
          <p className="title">Creators</p>
          <p className="subtitle">{entities.totalCount} studio</p>
          <a
            className="button is-large"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
            }}
          >
            <span className="icon is-medium">
              <i className="fas fa-plus"></i>
            </span>
          </a>
        </motion.article>

        <motion.article
          className="tile is-child notification is-warning"
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
          whileHover={{
            scale: 1.05,
            boxShadow: '2px 1px 10px rgba(0, 0, 0, 0.2)',
          }}
          whileTap={{ scale: 1 }}
        >
          <p className="title">Events</p>
          <p className="subtitle">{entities.totalCount} events</p>
          <a
            className="button is-large"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: 'none',
            }}
          >
            <span className="icon is-medium">
              <i className="fas fa-plus"></i>
            </span>
          </a>
        </motion.article>
      </section>
    </section>
  );
};

Game.propTypes = propTypes;

export default Game;
