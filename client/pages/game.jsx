import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import Spinner from '../components/Spinner';

import gameQuery from '../gql/gameById';

const propTypes = {
  id: PropTypes.number.isRequired,
};

const Game = ({ id }) => {
  const game = useQuery({ query: gameQuery, variables: { id } })[0];

  const [dialogVisible, setDialogVisible] = useState(false);

  if (!game.data) {
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
  } = game.data.gameById;

  return (
    <div>
      <section className="hero">
        <div className="hero-body is-primary">
          <div className="container">
            <h1 className="title">{name}</h1>
            <h2 className="subtitle">
              <a href={site}>{site}</a>
            </h2>

            <article className="message is-dark">
              <div className="message-body">{about}</div>
            </article>

            <div className="hero-foot">
              <div
                className="tags are-large"
                style={{ textTransform: 'capitalize' }}
              >
                {tags.nodes.map(tag => (
                  <A className="tag is-link" href={`/tag/${tag.id}`}>
                    {tag.name}
                  </A>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="tile is-ancestor">
        <div className="tile is-vertical is-8">
          <div className="tile">
            <div className="tile is-parent is-vertical">
              <article className="tile is-child notification is-primary">
                <p className="title">People</p>
                <p className="subtitle">{people.totalCount} people</p>
              </article>

              <article className="tile is-child notification is-warning">
                <p className="title">Entities</p>
                <p className="subtitle">{entities.totalCount} entity</p>
              </article>
            </div>

            <div className="tile is-parent">
              <article className="tile is-child notification is-info">
                <p className="title">Images</p>
                <p className="subtitle">{images.totalCount} images</p>
                <figure className="image is-4by3">
                  <img src="https://bulma.io/images/placeholders/640x480.png" />
                </figure>
              </article>
            </div>
          </div>

          <div className="tile is-parent">
            <article className="tile is-child notification is-danger">
              <p className="title">Events</p>
              <p className="subtitle">{events.totalCount} events</p>

              <button
                className="button is-light"
                onClick={() => setDialogVisible(true)}
              >
                Add
              </button>

              <div className={dialogVisible ? 'modal is-active' : 'modal'}>
                <div className="modal-background" />
                <div className="modal-card">
                  <header className="modal-card-head">
                    <p className="modal-card-title">Modal title</p>
                    <button className="delete" aria-label="close" />
                  </header>
                  <section className="modal-card-body">Test</section>
                  <footer className="modal-card-foot">
                    <button className="button is-success">Save changes</button>
                    <button className="button">Cancel</button>
                  </footer>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div className="tile is-parent">
          <article className="tile is-child notification is-success">
            <div className="content">
              <p className="title">About</p>
              <p className="subtitle">{about}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

Game.propTypes = propTypes;

export default Game;
