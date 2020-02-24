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
  Avatar,
  AvatarBadge,
  IconButton,
} from '@chakra-ui/core';

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string(),
  about: yup.string(),
});

const propTypes = {
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  defaultData: PropTypes.shape({
    avatar: PropTypes.any,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    about: PropTypes.string,
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const ProfileForm = ({ loading, onSubmit, defaultData }) => {
  const avatarRef = useRef();
  const [avatar, setAvatar] = useState(defaultData.avatar);
  const { handleSubmit, register, errors } = useForm({
    validationSchema,
  });

  const { firstName, lastName, about } = defaultData;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5} textAlign="center">
        <FormLabel htmlFor="avatar">
          <Avatar size="2xl" margin="1rem" src={avatar}>
            <AvatarBadge size="1em" bg="white">
              <IconButton
                aria-label="Edit avatar"
                icon="edit"
                variantColor="teal"
                isRound
                onClick={() => avatarRef.current.click()}
              />
            </AvatarBadge>
          </Avatar>
        </FormLabel>

        <Input
          display="none"
          type="file"
          id="avatar"
          name="avatar"
          ref={node => {
            register(node);
            avatarRef.current = node;
          }}
          onChange={e => {
            const [file] = e.target.files;

            if (file) {
              setAvatar(window.URL.createObjectURL(file));
            }
          }}
          accept="image/*"
        />
      </FormControl>

      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input name="firstName" defaultValue={firstName} ref={register} />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName}>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input name="lastName" defaultValue={lastName} ref={register} />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          placeholder="What's your life like..."
          name="about"
          defaultValue={about}
          ref={register}
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        display="block"
        width="100%"
        type="submit"
        mt={3}
        variantColor="teal"
        isDisabled={loading}
        isLoading={loading}
      >
        Save
      </Button>
    </form>
  );
};

ProfileForm.propTypes = propTypes;
ProfileForm.defaultProps = defaultProps;

export default ProfileForm;
