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
} from '@chakra-ui/react';

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
  const {
    handleSubmit,
    register,

    formState: {
      errors,
    },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input {...register('firstName')} />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName} isRequired>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input {...register('lastName')} />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.email} isRequired>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input {...register('email')} />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.password} isRequired>
        <FormLabel htmlFor="password">Password</FormLabel>
        <Input {...register('password')} type="password" />
        <FormErrorMessage>
          {errors.password && errors.password.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.passwordConfirmation} isRequired>
        <FormLabel htmlFor="password2">Password confirmation</FormLabel>
        <Input {...register('passwordConfirmation')} type="password" />
        <FormErrorMessage>
          {errors.passwordConfirmation && errors.passwordConfirmation.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        mt={3}
        colorScheme="green"
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
