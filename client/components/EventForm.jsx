import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Textarea,
} from '@chakra-ui/core';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .default(() => 'event!')
    .required(),
  about: yup.string().required(),
  start: yup
    .date()
    .default(() => {
      const now = new Date();
      return now.toISOString();
    })
    .required(),
  end: yup
    .date()
    .default(() => {
      const now = new Date();
      now.setHours(now.getHours() + 1);
    })
    .when('start', (start, schema) => schema.min(start))
    .required(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const SignupForm = ({ onSubmit }) => {
  const { handleSubmit, register, errors, getValues } = useForm({
    validationSchema,
  });

  const values = getValues();
  console.log(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input name="name" ref={register} />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.about} isRequired>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea name="about" resize="vertical" ref={register} />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.start} isRequired>
        <FormLabel htmlFor="start">Start</FormLabel>
        <Input name="start" type="datetime-local" ref={register} />
        <FormErrorMessage>
          {errors.start && errors.start.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.end} isRequired>
        <FormLabel htmlFor="end">End</FormLabel>
        <Input name="end" type="datetime-local" ref={register} />
        <FormErrorMessage>
          {errors.end && errors.end.message}
        </FormErrorMessage>
      </FormControl>

      <Button type="submit">Submit</Button>
    </form>
  );
};

SignupForm.propTypes = propTypes;

export default SignupForm;
