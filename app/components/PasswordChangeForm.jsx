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
import { Form, useSubmit } from '@remix-run/react';

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
      <FormControl mb={5} isInvalid={errors.oldPassword} isRequired>
        <FormLabel htmlFor="oldPassword">Current Password</FormLabel>
        <PasswordInput
          {...register('oldPassword')}
          id="oldPassword"
          placeholder="SoS3cr3t"
        />
        <FormErrorMessage>
          {errors.oldPassword && errors.oldPassword.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.password} isRequired>
        <FormLabel htmlFor="password">New Password</FormLabel>
        <PasswordInput
          {...register('password')}
          id="password"
          placeholder="SoS3cr3t 2"
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
          placeholder="SoS3cr3t 2"
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
        Change
      </Button>
    </Form>
  );
};

PasswordChangeForm.propTypes = propTypes;

export default PasswordChangeForm;
