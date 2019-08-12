import React from 'react';
import { useMutation } from 'urql';
import { A } from 'hookrouter';

import LoginForm from '/components/LoginForm';

import loginMutation from '../gql/login';

const Connect = () => {
  const [res, login] = useMutation(loginMutation);

  function handleLogin ({ email, password }) {
    login({ email, password }).then(({ error, data }) => {
      console.log(data, error);
      if (!error && data.authenticate.jwtToken) {
        localStorage.setItem('jwt', data.authenticate.jwtToken);
        location.assign('/');
      }
    });
  }

  return (
    <div className="container" style={{ maxWidth: 340 }}>
      {res.error && (
        <div className="message is-danger">
          <div className="message-header">{res.error.name}</div>
          <div className="message-body">{res.error.message}</div>
        </div>
      )}

      {res.data && !res.data.authenticate.jwtToken && (
        <div className="message is-danger">
          <div className="message-header">Oups</div>
          <div className="message-body">Login failed!</div>
        </div>
      )}

      <LoginForm onSubmit={handleLogin} />

      <p>
        New to the site? <A href="/signup">Create an account!</A>
      </p>
    </div>
  );
};

export default Connect;
