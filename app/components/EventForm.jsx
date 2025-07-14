import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Input,
  Button,
  Textarea,
  AspectRatio,
  Image,
  IconButton,
  Box,
  Grid,
  Switch,
  Field,
} from '@chakra-ui/react';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { FiEdit } from 'react-icons/fi';
import { Map } from 'pigeon-maps';
import { viewport } from '@mapbox/geo-viewport';
import { format } from 'date-fns';

import PlacesSearch from './PlacesSearch';
import usePlaceholder from '../hooks/usePlaceholder';
import { Form, useSubmit } from '@remix-run/react';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  canceled: yup.bool().default(false),
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
  defaultData: PropTypes.shape({
    cover: PropTypes.any,
    name: PropTypes.string,
    status: PropTypes.oneOf(['ongoing', 'canceled']),
    about: PropTypes.string,
    location: PropTypes.shape({
      id: PropTypes.string,
      street: PropTypes.string,
      city: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      country_code: PropTypes.string.isRequired,
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

const EventForm = ({ defaultData, loading, ...rest }) => {
  const submit = useSubmit();
  const placeholder = usePlaceholder();
  const {
    name,
    status,
    starts_at: startsAt,
    ends_at: endsAt,
    location: l,
    about,
  } = defaultData;
  const coverRef = useRef();
  const [cover, setCover] = useState(defaultData.cover);
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name,
      canceled: status === 'canceled',
      start: startsAt
        ? format(new Date(startsAt), "yyyy-MM-dd'T'HH:mm")
        : undefined,
      end: endsAt ? format(new Date(endsAt), "yyyy-MM-dd'T'HH:mm") : undefined,
      location: {
        label: l
          ? `${l.street ? l.street + ', ' : ''}${l.city}, ${l.region}, ${
              l.country_code
            }`
          : '',
        value: l || null,
      },
      about,
    },
  });

  const location = watch('location');

  const coverProps = register('cover');

  return (
    <Grid
      as={Form}
      encType="multipart/form-data"
      gridTemplateColumns="1fr 1fr"
      gap={5}
      method="post"
      onSubmit={handleSubmit((values, event) => {
        submit(event.nativeEvent.submitter || event.currentTarget, {
          method: 'post',
          replace: true,
        });
      })}
      {...rest}
    >
      <Field.Root gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <Field.Label htmlFor="name">Name</Field.Label>
        <Input
          {...register('name')}
          id="name"
          placeholder="Stunfest 2042, Global Game Jam Bamako, Indie Online Fest..."
        />
        <Field.ErrorText>
          {errors.name && errors.name.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root
        gridColumn="1 / 3"
        isInvalid={errors.canceled}
        display="flex"
      >
        <Field.Label htmlFor="canceled">Mark as canceled</Field.Label>
        <Controller
          name="canceled"
          control={control}
          defaultValue={status}
          render={({ field }) => (
            <Switch
              {...field}
              id="canceled"
              colorScheme="red"
              defaultChecked={field.value}
            />
          )}
        />
        <Field.ErrorText>
          {errors.canceled && errors.canceled.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root isInvalid={errors.start} isRequired>
        <Field.Label htmlFor="start">Start</Field.Label>
        <Input
          {...register('start')}
          id="start"
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          placeholder="When does it starts?"
        />
        <Field.ErrorText>
          {errors.start && errors.start.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root gridColumn="2 / 3" isInvalid={errors.end} isRequired>
        <Field.Label htmlFor="end">End</Field.Label>
        <Input
          {...register('end')}
          id="end"
          type="datetime-local"
          pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
          placeholder="When does it ends?"
        />
        <Field.ErrorText>{errors.end && errors.end.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root gridColumn="1 / 3">
        <Field.Label htmlFor="location">Location</Field.Label>

        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <PlacesSearch
              inputProps={{ id: 'location' }}
              {...field}
              placeholder="Where is the party?"
              onClear={() => setValue('location', { label: '', value: null })}
              onError={() => {
                setError('location', {
                  type: 'custom',
                  message: 'There was a problem retrieving data.',
                });
              }}
            />
          )}
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
              zoom={
                location.value.bbox
                  ? viewport(location.value.bbox, [474, 100]).zoom
                  : 16
              }
              mouseEvents={false}
              touchEvents={false}
            />
          </Box>
        )}
      </Field.Root>

      <Field.Root gridColumn="1 / 3">
        <Field.Label htmlFor="cover">Cover</Field.Label>

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
            icon={<FiEdit />}
            colorScheme="teal"
            borderRadius="full"
            onClick={() => coverRef.current.click()}
          />
        </Box>

        <Input
          display="none"
          type="file"
          id="cover"
          name="cover"
          ref={useMergeRefs(coverRef, coverProps.ref)}
          onChange={(e) => {
            const [file] = e.target.files;

            if (file) {
              setCover({ url: window.URL.createObjectURL(file) });
            }
          }}
          accept="image/*"
        />
      </Field.Root>

      <Field.Root gridColumn="1 / 3" isInvalid={errors.about}>
        <Field.Label htmlFor="about">About</Field.Label>
        <Textarea
          {...register('about')}
          id="about"
          minH="15rem"
          resize="vertical"
          placeholder="What is it about?"
          whiteSpace="pre-wrap"
        />
        <Field.ErrorText>
          {errors.about && errors.about.message}
        </Field.ErrorText>
      </Field.Root>

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
