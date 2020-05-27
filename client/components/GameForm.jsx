import React, { useRef, useState } from 'react';
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
  AspectRatioBox,
  Image,
  IconButton,
  Box,
  Grid,
} from '@chakra-ui/core';

import usePlaceholder from '../hooks/usePlaceholder';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  about: yup.string(),
  site: yup.string().url(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  defaultData: PropTypes.shape({
    name: PropTypes.string,
    about: PropTypes.string,
    site: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.any),
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const GameForm = ({ defaultData, onSubmit, loading }) => {
  const { name, about, site, images } = defaultData;
  const { handleSubmit, register, errors } = useForm({
    validationSchema,
    defaultValues: {
      name,
      about,
      site,
      images,
    },
  });

  return (
    <Grid
      as="form"
      enctype="multipart/form-data"
      onSubmit={handleSubmit(onSubmit)}
      gridTemplateColumns="1fr 1fr"
      gap={5}
    >
      <FormControl gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="Super Tractor Simulator 2042, Assassin's Greed..."
          ref={register}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          name="about"
          minH="15rem"
          resize="vertical"
          placeholder="What is it about?"
          whiteSpace="pre-wrap"
          ref={register}
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.site}>
        <FormLabel htmlFor="site">Site</FormLabel>
        <Input
          name="site"
          placeholder="https://example.com"
          ref={register}
        />
        <FormErrorMessage>
          {errors.site && errors.site.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        gridColumn="1 / 3"
        variantColor="teal"
        mt={3}
        type="submit"
        isLoading={loading}
        isDisabled={loading}
      >
        Submit
      </Button>
    </Grid>
  );
};

GameForm.propTypes = propTypes;
GameForm.defaultProps = defaultProps;

export default GameForm;