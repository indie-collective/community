import { Form } from 'react-router';
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Input,
  Button,
  Textarea,
  Grid,
  IconButton,
  Box,
  AspectRatio,
  Image,
  Flex,
  Field,
} from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import { Map } from 'pigeon-maps';
import { viewport } from '@mapbox/geo-viewport';

import PlacesSearch from '../components/PlacesSearch';
import PossibleOrgDuplicates from '../components/PossibleOrgDuplicates';
import usePlaceholder from '../hooks/usePlaceholder';
import useMergeRefs from '../hooks/useMergeRefs';

const validationSchema = yup.object().shape({
  type: yup.string().oneOf(['studio', 'association']).required(),
  name: yup.string().required(),
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
  about: yup.string(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  defaultData: PropTypes.shape({
    logo: PropTypes.any,
    type: PropTypes.oneOf(['studio', 'association']),
    name: PropTypes.string,
    location: PropTypes.shape({
      id: PropTypes.string,
      street: PropTypes.string,
      city: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      country_code: PropTypes.string.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
    site: PropTypes.string,
    about: PropTypes.string,
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const TYPES_COLORS = {
  studio: 'yellow',
  association: 'green',
};

function CustomRadio({ ref, ...props }) {
  return (
    <Box asChild>
      <label>
        <input {...input} ref={ref} />
        {props.children}
      </label>
    </Box>
  );
}

const OrgForm = ({ defaultData, loading, ...rest }) => {
  const placeholder = usePlaceholder();
  const logoRef = useRef();
  const [logo, setLogo] = useState(defaultData.logo);

  const { id, type = 'studio', name, location: l, site, about } = defaultData;
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type,
      name,
      location: {
        label: l
          ? `${l.street ? l.street + ', ' : ''}${l.city}, ${l.region}, ${
              l.country_code
            }`
          : '',
        value: l || null,
      },
      site,
      about,
    },
  });

  const location = watch('location');
  const newOrgName = watch('name');

  const logoProps = register('logo');

  return (
    <Grid
      encType="multipart/form-data"
      gridTemplateColumns="1fr 1fr"
      gap={5}
      {...rest}
      asChild
    >
      <Form onSubmit={handleSubmit}>
        <Field.Root gridColumn="1 / 3">
          <Field.Label htmlFor="Logo">Logo</Field.Label>

          <Box position="relative" w="25%">
            <AspectRatio ratio={1} onClick={() => logoRef.current.click()}>
              <Image
                size="100%"
                objectFit="logo"
                src={logo?.url ?? placeholder}
                alt="Event logo"
                borderRadius={5}
              />
            </AspectRatio>

            <IconButton
              position="absolute"
              right={2}
              bottom={2}
              aria-label="Edit logo"
              colorPalette="green"
              rounded="full"
              onClick={() => logoRef.current.click()}
            >
              <LuPencil />
            </IconButton>
          </Box>

          <Input
            {...logoProps}
            ref={useMergeRefs(logoRef, logoProps.ref)}
            display="none"
            type="file"
            id="logo"
            onChange={(e) => {
              const [file] = e.target.files;

              if (file) {
                setLogo({ url: window.URL.createObjectURL(file) });
              }
            }}
            accept="image/*"
          />
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.type} required>
          <Field.Label htmlFor="name">Type</Field.Label>
          <Flex>
            <CustomRadio
              color={TYPES_COLORS.studio}
              flex="1"
              mr={2}
              {...register('type')}
            >
              Studio
            </CustomRadio>
            <CustomRadio
              color={TYPES_COLORS.association}
              flex="1"
              value="ASSOCIATION"
              {...register('type')}
            >
              Association
            </CustomRadio>
          </Flex>
          <Field.ErrorText>
            {errors.type && errors.type.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.name} required>
          <Field.Label htmlFor="name">Name</Field.Label>
          <Input
            {...register('name')}
            placeholder="Indie Collective, Electronic Darts..."
          />
          <PossibleOrgDuplicates value={newOrgName} ignoredId={id} />
          <Field.ErrorText>
            {errors.name && errors.name.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.location}>
          <Field.Label htmlFor="location">Location</Field.Label>

          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <PlacesSearch
                {...field}
                placeholder="Rennes, France"
                onClear={() => {
                  setValue('location', { label: '', value: null });
                  clearErrors('location');
                }}
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

          <Field.ErrorText>
            {errors.location && errors.location.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.site}>
          <Field.Label htmlFor="site">Site</Field.Label>
          <Input {...register('site')} placeholder="https://example.com" />
          <Field.ErrorText>
            {errors.site && errors.site.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.about}>
          <Field.Label htmlFor="about">About</Field.Label>
          <Textarea
            {...register('about')}
            minH="15rem"
            resize="vertical"
            placeholder="What is this organization doing?"
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

OrgForm.propTypes = propTypes;
OrgForm.defaultProps = defaultProps;

export default OrgForm;
