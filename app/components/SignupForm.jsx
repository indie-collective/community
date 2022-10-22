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
import { PasswordInput } from './PasswordInput';
import { Form } from '@remix-run/react';

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string(),
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
};

const SignupForm = ({ loading, ...rest }) => {
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
    <Form onSubmit={handleSubmit} {...rest}>
      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input
          {...register('firstName')}
          id="firstName"
          type="text"
          placeholder="Jean-Michel"
        />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName}>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input
          {...register('lastName')}
          id="lastName"
          type="text"
          placeholder="Jam"
        />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.email} isRequired>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder="jmj@indieco.xyz"
        />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.password} isRequired>
        <FormLabel htmlFor="password">Password</FormLabel>
        <PasswordInput
          {...register('password')}
          id="password"
          placeholder="SoS3cr3t"
        />
        <FormErrorMessage>
          {errors.password && errors.password.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.passwordConfirmation} isRequired>
        <FormLabel htmlFor="password2">Password confirmation</FormLabel>
        <PasswordInput
          {...register('passwordConfirmation')}
          id="passwordConfirmation"
          placeholder="SoS3cr3t"
        />
        <FormErrorMessage>
          {errors.passwordConfirmation && errors.passwordConfirmation.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        width="100%"
        mt={8}
        colorScheme="teal"
        isDisabled={loading}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </Form>
  );
};

SignupForm.propTypes = propTypes;

export default SignupForm;
