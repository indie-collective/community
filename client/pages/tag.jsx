import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'urql';
import { A } from 'hookrouter';

import Spinner from '../components/Spinner';

const tagQuery = `
  query tagbyId($id: UUID!) {
    tag(id: $id) {
      id
      name
      games {
        totalCount
        nodes {
          id
          name
          about
          tags {
            totalCount
            nodes {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const propTypes = {
  id: PropTypes.number.isRequired,
};

const Tag = ({ id }) => {
  const tag = useQuery({ query: tagQuery, variables: { id } })[0];

  if (!tag.data) {
    return <Spinner />;
  }

  return (
    <div>
      <h1>Tag: {tag.data.tag.name}</h1>

      {tag.data.tag.games.nodes.map(game => (
        <div key={game.id}>
          <h2>
            <A href={`/game/${game.id}`}>{game.name}</A>
          </h2>
          <div className="tags" style={{ marginBottom: 10 }}>
            {game.tags.nodes.map(t => (
              <A href={`/tag/${t.id}`} className="tag is-link">
                {t.name}
              </A>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

Tag.propTypes = propTypes;

export default Tag;
