import React from 'react';
import { useQuery, useMutation } from 'urql';

import GameForm from '../components/GameForm';
import DebugTable from '../components/DebugTable';

import gamesQuery from '../gql/games';
import createGame from '../gql/createGame';

const CreateGame = () => {
  const allGames = useQuery({
    query: gamesQuery,
  })[0];

  const [up, setup] = useMutation(createGame);

  return (
    <div>
      <DebugTable
        keys={['name', 'about', 'site']}
        data={allGames.data ? allGames.data.allGames.nodes : []}
      />
      <div className="box">
        <GameForm onSubmit={values => setup(values)} />
      </div>
    </div>
  );
};

export default CreateGame;
