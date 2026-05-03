import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button, Field } from '@chakra-ui/react';
import { PasswordInput } from './PasswordInput';
import { Form, useSubmit } from 'react-router';

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string(),
  email: yup.string().email().required(),
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
  const submit = useSubmit();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  return (
    <Form
      method="post"
      onSubmit={handleSubmit((values, event) => {
        submit(event.nativeEvent.submitter || event.currentTarget, {
          method: 'post',
          replace: true,
        });
      })}
      {...rest}
    >
      <Field.Root mb={5} invalid={errors.firstName} required>
        <Field.Label htmlFor="firstName">First name</Field.Label>
        <Input
          {...register('firstName')}
          id="firstName"
          type="text"
          placeholder="Jean-Michel"
        />
        <Field.ErrorText>
          {errors.firstName && errors.firstName.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.lastName}>
        <Field.Label htmlFor="lastName">Last name</Field.Label>
        <Input
          {...register('lastName')}
          id="lastName"
          type="text"
          placeholder="Jam"
        />
        <Field.ErrorText>
          {errors.lastName && errors.lastName.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.email} required>
        <Field.Label htmlFor="email">Email</Field.Label>
        <Input
          {...register('email')}
          id="email"
          type="email"
          placeholder="jmj@indieco.xyz"
        />
        <Field.ErrorText>
          {errors.email && errors.email.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.password} required>
        <Field.Label htmlFor="password">Password</Field.Label>
        <PasswordInput
          {...register('password')}
          id="password"
          placeholder="SoS3cr3t"
        />
        <Field.ErrorText>
          {errors.password && errors.password.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.passwordConfirmation} required>
        <Field.Label htmlFor="password2">Password confirmation</Field.Label>
        <PasswordInput
          {...register('passwordConfirmation')}
          id="passwordConfirmation"
          placeholder="SoS3cr3t"
        />
        <Field.ErrorText>
          {errors.passwordConfirmation && errors.passwordConfirmation.message}
        </Field.ErrorText>
      </Field.Root>
      <Button
        type="submit"
        width="100%"
        mt={8}
        colorPalette="green"
        disabled={loading}
        loading={loading}
      >
        Sign Up
      </Button>
    </Form>
  );
};

SignupForm.propTypes = propTypes;

export default SignupForm;
