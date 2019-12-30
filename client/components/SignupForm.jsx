import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from '@chakra-ui/core';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
});

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const SignupForm = ({ onSubmit }) => {
  const { handleSubmit, register, errors } = useForm({
    validationSchema,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} isInvalid={errors.email} isRequired>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input name="email" ref={register} />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.password} isRequired>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input name="password" type="password" ref={register} />
        <FormErrorMessage>
          {errors.password && errors.password.message}
        </FormErrorMessage>
      </FormControl>

      <Button type="submit">Submit</Button>
    </form>
  );
};

SignupForm.propTypes = propTypes;

export default SignupForm;
