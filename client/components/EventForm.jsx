import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Textarea,
  AspectRatio,
  Image,
  IconButton,
  Box,
  Grid,
  Switch,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import Map from 'pigeon-maps';
import { viewport } from '@mapbox/geo-viewport';
import { format } from 'date-fns';

import PlacesSearch from './PlacesSearch';
import usePlaceholder from '../hooks/usePlaceholder';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  status: yup.string().oneOf(['ONGOING', 'CANCELED']).default('ONGOING'),
  about: yup.string(),
  location: yup.object({
    label: yup.string(),
    value: yup
      .object({
        id: yup.string().nullable(),
        type: yup
          .string()
          .notOneOf(['country'], 'You need to specify at least a country'),
      })
      .nullable(),
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
    status: PropTypes.oneOf(['ONGOING', 'CANCELED']),
    about: PropTypes.string,
    location: PropTypes.shape({
      id: PropTypes.string,
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

const OSMServer = 'abc'.charAt(Math.floor(Math.random() * 3));

const EventForm = ({ defaultData, onSubmit, loading }) => {
  const placeholder = usePlaceholder();
  const { name, status, startsAt, endsAt, location: l, about } = defaultData;
  const coverRef = useRef();
  const [cover, setCover] = useState(defaultData.cover);
  const { handleSubmit, register, errors, control, watch, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name,
      status,
      start: startsAt
        ? format(new Date(startsAt), "yyyy-MM-dd'T'HH:mm")
        : undefined,
      end: endsAt ? format(new Date(endsAt), "yyyy-MM-dd'T'HH:mm") : undefined,
      location: {
        label: l
          ? `${l.street ? l.street + ', ' : ''}${l.city}, ${l.region}, ${
              l.countryCode
            }`
          : '',
        value: l || null,
      },
      about,
    },
  });

  const location = watch('location');

  return (
    <Grid
      as="form"
      encType="multipart/form-data"
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

      <FormControl gridColumn="1 / 3" isInvalid={errors.status}>
        <FormLabel htmlFor="status">Mark as canceled</FormLabel>
        <Controller
          name="status"
          control={control}
          defaultValue={status}
          render={(props) => (
            <Switch
              id="status"
              colorScheme="red"
              isChecked={props.value === 'CANCELED'}
              onChange={(e) =>
                props.onChange(e.target.checked ? 'CANCELED' : 'ONGOING')
              }
            />
          )}
        />
        <FormErrorMessage>
          {errors.status && errors.status.message}
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

      <FormControl gridColumn="1 / 3">
        <FormLabel htmlFor="location">Location</FormLabel>

        <Controller
          as={<PlacesSearch />}
          control={control}
          name="location"
          placeholder="Where is the party?"
          onClear={() => setValue('location', { label: '', value: null })}
        />

        {location.value && (
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
              center={[location.value.latitude, location.value.longitude]}
              zoom={location.value.bbox ? viewport(location.value.bbox, [474, 100]).zoom : 16}
              mouseEvents={false}
              touchEvents={false}
            />
          </Box>
        )}
      </FormControl>

      <FormControl gridColumn="1 / 3">
        <FormLabel htmlFor="cover">Cover</FormLabel>

        <Box position="relative">
          <AspectRatio ratio={3} onClick={() => coverRef.current.click()}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover && cover.url}
              alt="Event cover"
              fallbackSrc={placeholder}
              borderRadius={5}
            />
          </AspectRatio>

          <IconButton
            position="absolute"
            right={2}
            bottom={2}
            aria-label="Edit cover"
            icon={<EditIcon />}
            colorScheme="teal"
            isRound
            onClick={() => coverRef.current.click()}
          />
        </Box>

        <Input
          display="none"
          type="file"
          id="cover"
          name="cover"
          ref={(node) => {
            register(node);
            coverRef.current = node;
          }}
          onChange={(e) => {
            const [file] = e.target.files;

            if (file) {
              setCover({ url: window.URL.createObjectURL(file) });
            }
          }}
          accept="image/*"
        />
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

      <Button
        gridColumn="1 / 3"
        colorScheme="teal"
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

EventForm.propTypes = propTypes;
EventForm.defaultProps = defaultProps;

export default EventForm;
