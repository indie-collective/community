import React from 'react';
import { useQuery, useMutation } from 'urql';

import GameForm from '../components/GameForm';

import createGame from '../gql/createGame';

const CreateGame = () => {
  const [up, setup] = useMutation(createGame);

  return (
    <section className="container">
      <h1>Create game</h1>
      <div className="box">
        <GameForm onSubmit={values => setup(values)} />
      </div>
    </section>
  );
};

export default CreateGame;
