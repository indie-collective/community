import React, { useState } from 'react';
import { func } from 'prop-types';
import { Form, Button } from 'react-bootstrap';

const propTypes = {
  onSubmit: func.isRequired,
};

const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ email, password });
      }}
    >
      <Form.Group controlId="formEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Login
      </Button>
    </Form>
  );
}

LoginForm.propTypes = propTypes;

export default LoginForm;
