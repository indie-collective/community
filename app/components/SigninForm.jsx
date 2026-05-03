import React from 'react';
import { useColorModeValue as mode } from "./ui/color-mode";
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button, Link as ChakraLink, Flex, HStack, Checkbox, Field } from '@chakra-ui/react';
import { Form, Link, useSearchParams, useSubmit } from 'react-router';

import { PasswordInput } from './PasswordInput';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
};

const SigninForm = ({ loading }) => {
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
    >
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
      <Button
        type="submit"
        display="block"
        ml="auto"
        mt={8}
        colorPalette="green"
        disabled={loading}
        loading={loading}
        width="100%"
      >
        Sign In
      </Button>
    </Form>
  );
};

SigninForm.propTypes = propTypes;

export default SigninForm;
