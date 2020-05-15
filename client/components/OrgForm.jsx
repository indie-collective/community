import React from 'react';
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
  Grid,
  RadioButtonGroup,
} from '@chakra-ui/core';

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
  const { isChecked, isDisabled, value, color = 'green', ...rest } = props;
  return (
    <Button
      ref={ref}
      variantColor={isChecked ? color : 'gray'}
      aria-checked={isChecked}
      role="radio"
      isDisabled={isDisabled}
      {...rest}
    />
  );
});

const OrgForm = ({ defaultData, onSubmit, loading }) => {
  const { type, name, about } = defaultData;
  const { handleSubmit, control, register, errors } = useForm({
    validationSchema,
    defaultValues: {
      type,
      name,
      about,
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
      <FormControl gridColumn="1 / 3" isInvalid={errors.type} isRequired>
        <FormLabel htmlFor="name">Type</FormLabel>
        <Controller
          as={<RadioButtonGroup />}
          control={control}
          name="type"
          defaultValue={{ value: "chocolate" }}

          display="flex"
          isInline
        > 
          <CustomRadio color={TYPES_COLORS.STUDIO} flex="1" value="STUDIO">
            Studio
          </CustomRadio>
          <CustomRadio
            color={TYPES_COLORS.ASSOCIATION}
            flex="1"
            value="ASSOCIATION"
          >
            Association
          </CustomRadio>
          <CustomRadio
            color={TYPES_COLORS.ORGANIZATION}
            flex="1"
            value="ORGANIZATION"
          >
            Organization
          </CustomRadio>
        </Controller>
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

OrgForm.propTypes = propTypes;
OrgForm.defaultProps = defaultProps;

export default OrgForm;
