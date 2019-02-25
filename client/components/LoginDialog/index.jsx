import React, { useState } from 'react';
import { useQuery, useMutation } from 'urql';
import {
  Dialog,
  Pane,
  TextInputField,
  toaster,
} from 'evergreen-ui';

import meQuery from '../../gql/me';
import loginMutation from '../../gql/login';

const LoginDialog = ({ visible, onClose }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  const login = useMutation(loginMutation)[1];
  const getMe = useQuery({ query: meQuery, requestPolicy: 'network-only' })[1];

  return (
    <Dialog
      width={320}
      isShown={visible}
      hasHeader={false}
      onConfirm={() => {
        login({ email, password })
          .then(d => {
            if (d.data.login.token) {
              localStorage.setItem('token', d.data.login.token);
              getMe();
              toaster.success(`Welcome back, ${d.data.login.user.email}!`)
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
  );
}


export default LoginDialog;
