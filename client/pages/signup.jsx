import React from 'react';
import { useMutation } from 'urql';
import { A, navigate } from 'hookrouter';

import SignupForm from '/components/SignupForm';

import signupMutation from '../gql/signup';

const Signup = () => {
  const [res, signup] = useMutation(signupMutation);

  function handleSignup({ email, password }) {
    signup({ email, password, firstName: '', lastName: '' }).then(
      ({ error }) => {
        if (!error) {
          navigate('/login');
        }
      }
    );
  }

  return (
    <div className="container" style={{ maxWidth: 340 }}>
      {res.error && (
        <div className="message is-danger">
          <div className="message-header">{res.error.name}</div>
          <div className="message-body">{res.error.message}</div>
        </div>
      )}

      <SignupForm onSubmit={handleSignup} />

      <p>
        Already have an account? <A href="/login">Log me in!</A>
      </p>
    </div>
  );
};

export default Signup;
