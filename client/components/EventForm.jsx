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
} from '@chakra-ui/core';

import PlacesSearch from './PlacesSearch';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .default(() => 'event!')
    .required(),
  about: yup.string(),
  country: yup.string(),
  region: yup.string(),
  city: yup.string(),
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
  defaultData: PropTypes.shape({
    cover: PropTypes.any,
    name: PropTypes.string,
    about: PropTypes.string,
    country: PropTypes.string,
    region: PropTypes.string,
    city: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string,
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const EventForm = ({ defaultData, onSubmit, loading }) => {
  const coverRef = useRef();
  const [cover, setCover] = useState(defaultData.cover);
  const { handleSubmit, register, errors } = useForm({
    validationSchema,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input name="name" ref={register} />
        <FormErrorMessage>
          {errors.name && errors.name.message}
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
        <FormErrorMessage>{errors.end && errors.end.message}</FormErrorMessage>
      </FormControl>

      <FormControl mb={5}>
        <FormLabel htmlFor="avatar">Cover</FormLabel>

        <Box position="relative">
          <AspectRatioBox ratio={3} onClick={() => coverRef.current.click()}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover}
              alt="Event cover"
              fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
            />
          </AspectRatioBox>

          <IconButton
            position="absolute"
            right={2}
            bottom={2}
            aria-label="Edit cover"
            icon="edit"
            variantColor="teal"
            isRound
            onClick={() => coverRef.current.click()}
          />
        </Box>

        <Input
          display="none"
          type="file"
          id="cover"
          name="cover"
          ref={node => {
            register(node);
            coverRef.current = node;
          }}
          onChange={e => {
            const [file] = e.target.files;

            if (file) {
              setCover(window.URL.createObjectURL(file));
            }
          }}
          accept="image/*"
        />
      </FormControl>

      <FormControl mb={5} isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea name="about" resize="vertical" ref={register} />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl
        as="fieldset"
        border="1px solid #eee"
        borderRadius={3}
        padding={2}
        mb={3}
      >
        <FormLabel as="legend">Location</FormLabel>

        <FormControl mb={5} isInvalid={errors.country}>
          <FormLabel htmlFor="country">Country</FormLabel>
          <Input name="country" ref={register} />
          <FormErrorMessage>
            {errors.country && errors.country.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={5} isInvalid={errors.region}>
          <FormLabel htmlFor="region">Region</FormLabel>
          <Input name="region" ref={register} />
          <FormErrorMessage>
            {errors.region && errors.region.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl mb={5} isInvalid={errors.city}>
          <FormLabel htmlFor="city">City</FormLabel>
          <Input name="city" ref={register} />
          <FormErrorMessage>
            {errors.city && errors.city.message}
          </FormErrorMessage>
        </FormControl>
      </FormControl>

      <Button type="submit" mt={5}>Submit</Button>
    </form>
  );
};

EventForm.propTypes = propTypes;
EventForm.defaultProps = defaultProps;

export default EventForm;
