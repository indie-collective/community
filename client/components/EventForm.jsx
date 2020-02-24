import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
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
import Map from 'pigeon-maps';

import PlacesSearch from './PlacesSearch';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  about: yup.string(),
  location: yup.object({
    type: yup
      .string()
      .notOneOf(['country'], 'You need to specify at least a city'),
  }),
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
    location: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      countryCode: PropTypes.string.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
    start: PropTypes.string,
    end: PropTypes.string,
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const zoomLevels = {
  address: 16,
  city: 11,
  country: 5,
  busStop: 17,
  trainStation: 17,
  townhall: 16,
  airport: 12,
};

const OSMServer = 'abc'.charAt(Math.floor(Math.random() * 3));

const EventForm = ({ defaultData, onSubmit, loading }) => {
  const { name, startsAt, endsAt, location: l, about } = defaultData;
  const coverRef = useRef();
  const [cover, setCover] = useState(defaultData.cover);
  const { handleSubmit, register, errors, control, watch, setValue } = useForm({
    validationSchema,
    defaultValues: {
      name,
      start: startsAt
        ? new Date(startsAt).toISOString().slice(0, -8)
        : undefined,
      end: endsAt ? new Date(endsAt).toISOString().slice(0, -8) : undefined,
      location: l
        ? {
            name: l.street,
            city: l.city,
            administrative: l.region,
            countryCode: l.countryCode,
            type: l.street ? 'address' : 'city',
            latlng: {
              lat: l.latitude,
              lng: l.longitude,
            },
          }
        : undefined,
      about,
    },
  });

  const location = watch('location');

  return (
    <Grid
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      gridTemplateColumns="1fr 1fr"
      gap={5}
    >
      <FormControl gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="Stunfest 2042, Global Game Jam Bamako, Indie Online Fest..."
          ref={register}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={errors.start} isRequired>
        <FormLabel htmlFor="start">Start</FormLabel>
        <Input
          name="start"
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          placeholder="When does it starts?"
          ref={register}
        />
        <FormErrorMessage>
          {errors.start && errors.start.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="2 / 3" isInvalid={errors.end} isRequired>
        <FormLabel htmlFor="end">End</FormLabel>
        <Input
          name="end"
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          placeholder="When does it ends?"
          ref={register}
        />
        <FormErrorMessage>{errors.end && errors.end.message}</FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.about}>
        <FormLabel htmlFor="location">Location</FormLabel>

        <Controller
          as={PlacesSearch}
          control={control}
          name="location"
          placeholder="Where is the party?"
          onChange={([{ suggestion }]) => {
            return { value: suggestion };
          }}
          onClear={() => setValue('location', null)}
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>

        {location && (
          <Box
            width="100%"
            height="100px"
            overflow="hidden"
            borderRadius={5}
            mt={2}
          >
            <Map
              provider={(x, y, z, dpr) => {
                const retina =
                  typeof dpr !== 'undefined'
                    ? dpr >= 2
                    : typeof window !== 'undefined' &&
                      window.devicePixelRatio >= 2;
                return `https://${OSMServer}.tile.openstreetmap.org/${z}/${x}/${y}${
                  retina ? '@2x' : ''
                }.png`;
              }}
              defaultWidth={800}
              defaultHeight={100}
              center={[location.latlng.lat, location.latlng.lng]}
              zoom={zoomLevels[location.type]}
              mouseEvents={false}
              touchEvents={false}
            ></Map>
          </Box>
        )}
      </FormControl>

      <FormControl gridColumn="1 / 3">
        <FormLabel htmlFor="avatar">Cover</FormLabel>

        <Box position="relative">
          <AspectRatioBox ratio={3} onClick={() => coverRef.current.click()}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover && cover.url}
              alt="Event cover"
              fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
              borderRadius={5}
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

      <FormControl gridColumn="1 / 3" isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          name="about"
          resize="vertical"
          placeholder="What is it about?"
          ref={register}
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <Button gridColumn="1 / 3" variantColor="teal" mt={3} type="submit">
        Submit
      </Button>
    </Grid>
  );
};

EventForm.propTypes = propTypes;
EventForm.defaultProps = defaultProps;

export default EventForm;