import { Form } from '@remix-run/react';
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
  Grid,
  IconButton,
  Box,
  AspectRatio,
  Image,
  useRadioGroup,
  useRadio,
  useStyleConfig,
  useButtonGroup,
  Flex,
  omitThemingProps,
  useMergeRefs,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { Map } from 'pigeon-maps';
import { viewport } from '@mapbox/geo-viewport';

import PlacesSearch from '../components/PlacesSearch';
import PossibleOrgDuplicates from '../components/PossibleOrgDuplicates';
import usePlaceholder from '../hooks/usePlaceholder';

const validationSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(['STUDIO', 'ASSOCIATION'])
    .required(),
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
  onSubmit: PropTypes.func.isRequired,
  defaultData: PropTypes.shape({
    logo: PropTypes.any,
    type: PropTypes.oneOf(['STUDIO', 'ASSOCIATION']),
    name: PropTypes.string,
    location: PropTypes.shape({
      id: PropTypes.string,
      street: PropTypes.string,
      city: PropTypes.string.isRequired,
      region: PropTypes.string.isRequired,
      countryCode: PropTypes.string.isRequired,
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }),
    site: PropTypes.string,
    about: PropTypes.string,
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {
    type: 'STUDIO',
  },
};

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
};

const CustomRadio = React.forwardRef((props, ref) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const { color = 'teal', value, name, ...otherProps } = omitThemingProps(
    props
  );

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  const group = useButtonGroup();
  const styles = useStyleConfig('Button', {
    ...group,
    ...props,
    colorScheme: input.checked ? color : 'gray',
  });

  const buttonStyles = {
    display: 'inline-flex',
    appearance: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 250ms',
    userSelect: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    outline: 'none',
    cursor: 'pointer',
    ...styles,
  };

  return (
    <Box as="label" {...otherProps} {...buttonStyles} {...checkbox}>
      <input {...input} ref={ref} />
      {props.children}
    </Box>
  );
});

const OrgForm = ({ defaultData, loading, ...rest }) => {
  const placeholder = usePlaceholder();
  const logoRef = useRef();
  const [logo, setLogo] = useState(defaultData.logo);

  const { id, type, name, location: l, site, about } = defaultData;
  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    formState: {
      errors,
    },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type,
      name,
      location: {
        label: l
          ? `${l.street ? l.street + ', ' : ''}${l.city}, ${l.region}, ${
              l.countryCode
            }`
          : '',
        value: l || null,
      },
      site,
      about,
    },
  });

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'type',
    defaultValue: type,
  });

  const location = watch('location');
  const newOrgName = watch('name');

  const logoProps = register('logo');

  return (
    <Grid
      as={Form}
      encType="multipart/form-data"
      gridTemplateColumns="1fr 1fr"
      gap={5}
      {...rest}
    >
      <FormControl gridColumn="1 / 3">
        <FormLabel htmlFor="Logo">Logo</FormLabel>

        <Box position="relative" w="25%">
          <AspectRatio ratio={1} onClick={() => logoRef.current.click()}>
            <Image
              size="100%"
              objectFit="logo"
              src={logo && logo.url}
              alt="Event logo"
              fallbackSrc={placeholder}
              borderRadius={5}
            />
          </AspectRatio>

          <IconButton
            position="absolute"
            right={2}
            bottom={2}
            aria-label="Edit logo"
            icon={<EditIcon />}
            colorScheme="teal"
            isRound
            onClick={() => logoRef.current.click()}
          />
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
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.type} isRequired>
        <FormLabel htmlFor="name">Type</FormLabel>
        <Flex isInline {...getRootProps()}>
          <CustomRadio
            color={TYPES_COLORS.STUDIO}
            flex="1"
            mr={2}
            {...register('type')}
            {...getRadioProps({ value: 'STUDIO' })}
          >
            Studio
          </CustomRadio>
          <CustomRadio
            color={TYPES_COLORS.ASSOCIATION}
            flex="1"
            value="ASSOCIATION"
            {...register('type')}
            {...getRadioProps({ value: 'ASSOCIATION' })}
          >
            Association
          </CustomRadio>
        </Flex>
        <FormErrorMessage>
          {errors.type && errors.type.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          {...register('name')}
          placeholder="Indie Collective, Electronic Darts..."
        />
        <PossibleOrgDuplicates value={newOrgName} ignoredId={id} />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3">
        <FormLabel htmlFor="location">Location</FormLabel>

        <Controller
          control={control}
          name="location"
          placeholder="Rennes, France"
          onClear={() => setValue('location', { label: '', value: null })}
          render={({ field }) => <PlacesSearch {...field} />}
          // photon
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
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.site}>
        <FormLabel htmlFor="site">Site</FormLabel>
        <Input {...register('site')} placeholder="https://example.com" />
        <FormErrorMessage>
          {errors.site && errors.site.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          {...register('about')}
          minH="15rem"
          resize="vertical"
          placeholder="What is this organization doing?"
          whiteSpace="pre-wrap"
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

OrgForm.propTypes = propTypes;
OrgForm.defaultProps = defaultProps;

export default OrgForm;
