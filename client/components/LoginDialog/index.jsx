import React, { useState } from 'react';
import { Connect, mutation } from 'urql';
import {
  Dialog,
  Pane,
  TextInputField,
} from 'evergreen-ui';

const loginMutation = `
  mutation(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      token
    }
  }
`;

const LoginDialog = ({ visible, onClose }) => {

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  return (
    <Connect
      mutation={{
        login: mutation(loginMutation),
      }}
    >
      {({ login }) => (
        <Dialog
          width={320}
          isShown={visible}
          hasHeader={false}
          onConfirm={() => {
            login({ email, password })
              .then(res => {
                if (res.login.token) {
                  localStorage.setItem('token', res.login.token);
                }
                onClose();
              });
          }}
          confirmLabel="Login"
        >
          <Pane>
            <TextInputField
              label="Email"
              placeholder="jean-michel.jam@indieco.xyz"
              onChange={e => setEmail(e.target.value)}
            />
            <TextInputField
              type="password"
              label="Password"
              placeholder="JAMTASTIC"
              onChange={e => setPassword(e.target.value)}
            />
          </Pane>
        </Dialog>
      )}
    </Connect>
  );
}


export default LoginDialog;
