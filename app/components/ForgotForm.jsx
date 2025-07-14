import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Input,
  Button,
  Field,
} from '@chakra-ui/react';
import { Form, useSubmit } from '@remix-run/react';

const validationSchema = yup.object().shape({
  email: yup.string().email().required(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
};

const ForgotForm = ({ loading }) => {
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
      <Field.Root mb={5} isInvalid={errors.email} isRequired>
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
        colorScheme="teal"
        isDisabled={loading}
        isLoading={loading}
        width="100%"
      >
        Reset password
      </Button>
    </Form>
  );
};

ForgotForm.propTypes = propTypes;

export default ForgotForm;
