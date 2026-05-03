import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button, Field } from '@chakra-ui/react';
import { PasswordInput } from './PasswordInput';
import { Form, useSubmit } from 'react-router';

const validationSchema = yup.object().shape({
  oldPassword: yup.string().required(),
  password: yup.string().required(),
  passwordConfirmation: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
};

const PasswordChangeForm = ({ loading, ...rest }) => {
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
      <Field.Root mb={5} invalid={errors.oldPassword} required>
        <Field.Label htmlFor="oldPassword">Current Password</Field.Label>
        <PasswordInput
          {...register('oldPassword')}
          id="oldPassword"
          placeholder="SoS3cr3t"
        />
        <Field.ErrorText>
          {errors.oldPassword && errors.oldPassword.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.password} required>
        <Field.Label htmlFor="password">New Password</Field.Label>
        <PasswordInput
          {...register('password')}
          id="password"
          placeholder="SoS3cr3t 2"
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
          placeholder="SoS3cr3t 2"
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
        Change
      </Button>
    </Form>
  );
};

PasswordChangeForm.propTypes = propTypes;

export default PasswordChangeForm;
