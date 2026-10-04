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
import { LuPencil } from 'react-icons/lu';
import TileMap from './TileMap';
import { viewport } from '@mapbox/geo-viewport';

import PlacesSearch from './PlacesSearch';
import usePlaceholder from '../hooks/usePlaceholder';
import useMergeRefs from '../hooks/useMergeRefs';
import { Form, useSubmit } from 'react-router';
import { dateToZonedInput } from '../utils/eventTime';

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


// Defaults as parameters: React 19 ignores defaultProps on function components.
const EventForm = ({ defaultData = {}, loading = false, ...rest }) => {
  const submit = useSubmit();
  const placeholder = usePlaceholder();
  const {
    name,
    status,
    starts_at: startsAt,
    ends_at: endsAt,
    time_zone: timeZone,
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
      // Wall-clock time where the event happens, as the action reads it (#204).
      start: startsAt ? dateToZonedInput(startsAt, timeZone) : undefined,
      end: endsAt ? dateToZonedInput(endsAt, timeZone) : undefined,
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
      encType="multipart/form-data"
      // minmax(0, 1fr): let the date inputs shrink instead of widening the page.
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gap={5}
      method="post"
      {...rest}
      asChild
    >
      <Form
        onSubmit={handleSubmit((values, event) => {
          submit(event.nativeEvent.submitter || event.currentTarget, {
            method: 'post',
            replace: true,
          });
        })}
      >
        <Field.Root gridColumn="1 / 3" invalid={errors.name} required>
          <Field.Label htmlFor="name">Name<Field.RequiredIndicator /></Field.Label>
          <Input
            {...register('name')}
            id="name"
            placeholder="Stunfest 2042, Global Game Jam Bamako, Indie Online Fest..."
          />
          <Field.ErrorText>
            {errors.name && errors.name.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.canceled} display="flex">
          <Field.Label>Mark as canceled</Field.Label>
          <Controller
            name="canceled"
            control={control}
            defaultValue={status}
            render={({ field }) => (
              <Switch.Root
                name={field.name}
                checked={!!field.value}
                onCheckedChange={({ checked }) => field.onChange(checked)}
                colorPalette="red"
              >
                <Switch.HiddenInput ref={field.ref} onBlur={field.onBlur} />
                <Switch.Control />
              </Switch.Root>
            )}
          />
          <Field.ErrorText>
            {errors.canceled && errors.canceled.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root invalid={errors.start} required>
          <Field.Label htmlFor="start">Start<Field.RequiredIndicator /></Field.Label>
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
        <Field.Root gridColumn="2 / 3" invalid={errors.end} required>
          <Field.Label htmlFor="end">End<Field.RequiredIndicator /></Field.Label>
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
          <Field.Label>Location</Field.Label>

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
              <TileMap
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
                src={cover?.url ?? placeholder}
                alt="Event cover"
                borderRadius={5}
              />
            </AspectRatio>

            <IconButton
              position="absolute"
              right={2}
              bottom={2}
              aria-label="Edit cover"
              colorPalette="green"
              rounded="full"
              onClick={() => coverRef.current.click()}
            >
              <LuPencil />
            </IconButton>
          </Box>

          <Input
            {...coverProps}
            ref={useMergeRefs(coverRef, coverProps.ref)}
            display="none"
            type="file"
            id="cover"
            onChange={(e) => {
              const [file] = e.target.files;

              if (file) {
                setCover({ url: window.URL.createObjectURL(file) });
              }
            }}
            accept="image/*"
          />
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.about}>
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
          colorPalette="green"
          mt={3}
          type="submit"
          loading={loading}
          disabled={loading}
        >
          Submit
        </Button>
      </Form>
    </Grid>
  );
};

EventForm.propTypes = propTypes;

export default EventForm;
