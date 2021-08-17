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
  Link,
  useColorModeValue as mode,
  Flex,
} from '@chakra-ui/react';

import { PasswordInput } from './PasswordInput';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const SigninForm = ({ loading, onSubmit }) => {
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
      <FormControl mb={5} isInvalid={errors.email} isRequired>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input {...register('email')} />
        <FormErrorMessage>
          {errors.email && errors.email.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl id="password" mb={5} isInvalid={errors.password} isRequired>
        <Flex justify="space-between" alignItems="baseline">
          <FormLabel htmlFor="password">Password</FormLabel>
          <Link
            color={mode('teal.600', 'teal.200')}
            fontWeight="semibold"
            fontSize="sm"
          >
            Forgot Password?
          </Link>
        </Flex>
        <PasswordInput {...register('password')} />

        <FormErrorMessage>
          {errors.password && errors.password.message}
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
      >
        Sign In
      </Button>
    </form>
  );
};

SigninForm.propTypes = propTypes;

export default SigninForm;
