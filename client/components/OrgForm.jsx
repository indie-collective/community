import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
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
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

import usePlaceholder from '../hooks/usePlaceholder';

const validationSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(['STUDIO', 'ASSOCIATION', 'ORGANIZATION'])
    .required(),
  name: yup.string().required(),
  about: yup.string(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  defaultData: PropTypes.shape({
    logo: PropTypes.any,
    type: PropTypes.oneOf(['STUDIO', 'ASSOCIATION', 'ORGANIZATION']),
    name: PropTypes.string,
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
  ORGANIZATION: 'purple',
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
    colorScheme: input.checked ? color : undefined,
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

const OrgForm = ({ defaultData, onSubmit, loading }) => {
  const placeholder = usePlaceholder();
  const logoRef = useRef();
  const [logo, setLogo] = useState(defaultData.logo);

  const { type, name, about } = defaultData;
  const { handleSubmit, register, errors } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type,
      name,
      about,
    },
  });

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'type',
    defaultValue: type,
  });

  return (
    <Grid
      as="form"
      encType="multipart/form-data"
      onSubmit={handleSubmit(onSubmit)}
      gridTemplateColumns="1fr 1fr"
      gap={5}
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
          display="none"
          type="file"
          id="logo"
          name="logo"
          ref={(node) => {
            register(node);
            logoRef.current = node;
          }}
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
            {...getRadioProps({ value: 'STUDIO' })}
            ref={register}
          >
            Studio
          </CustomRadio>
          <CustomRadio
            color={TYPES_COLORS.ASSOCIATION}
            flex="1"
            mr={2}
            value="ASSOCIATION"
            {...getRadioProps({ value: 'ASSOCIATION' })}
            ref={register}
          >
            Association
          </CustomRadio>
          <CustomRadio
            color={TYPES_COLORS.ORGANIZATION}
            flex="1"
            value="ORGANIZATION"
            {...getRadioProps({ value: 'ORGANIZATION' })}
            ref={register}
          >
            Organization
          </CustomRadio>
        </Flex>
        <FormErrorMessage>
          {errors.type && errors.type.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          name="name"
          placeholder="Indie Collective, Electronic Darts..."
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
          placeholder="What is this organization doing?"
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

OrgForm.propTypes = propTypes;
OrgForm.defaultProps = defaultProps;

export default OrgForm;
