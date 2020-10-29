import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
} from '@chakra-ui/core';

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
  passwordConfirmation: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const SignupForm = ({ loading, onSubmit }) => {
  const { handleSubmit, register, errors } = useForm({
    resolver: yupResolver(validationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input name="firstName" ref={register} />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName} isRequired>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input name="lastName" ref={register} />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

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

      <FormControl mb={5} isInvalid={errors.passwordConfirmation} isRequired>
        <FormLabel htmlFor="password2">Password confirmation</FormLabel>
        <Input name="passwordConfirmation" type="password" ref={register} />
        <FormErrorMessage>
          {errors.passwordConfirmation && errors.passwordConfirmation.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        mt={3}
        variantColor="green"
        isDisabled={loading}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </form>
  );
};

SignupForm.propTypes = propTypes;

export default SignupForm;
