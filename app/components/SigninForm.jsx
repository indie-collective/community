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
  Link as ChakraLink,
  useColorModeValue as mode,
  Flex,
  HStack,
  Checkbox
} from '@chakra-ui/react';
import { Form, Link, useSearchParams, useSubmit } from '@remix-run/react';

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

      <Button
        type="submit"
        display="block"
        ml="auto"
        mt={8}
        colorScheme="teal"
        isDisabled={loading}
        isLoading={loading}
        width="100%"
      >
        Sign In
      </Button>
    </Form>
  );
};

SigninForm.propTypes = propTypes;

export default SigninForm;
