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
  Avatar,
  AvatarBadge,
  IconButton,
  useMergeRefs,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

const validationSchema = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
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
  const { firstName, lastName, about } = defaultData;
  const [avatar, setAvatar] = useState(defaultData.avatar);
  const {
    handleSubmit,
    register,
    formState: {
      errors,
    },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName,
      lastName,
      about,
    },
  });


  const avatarProps = register('avatar');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl mb={5}>
        <FormLabel htmlFor="avatar" textAlign="center">
          <Avatar size="2xl" margin="1rem" src={avatar && avatar.url}>
            <AvatarBadge size="1em" bg="white">
              <IconButton
                aria-label="Edit avatar"
                icon={<EditIcon />}
                colorScheme="teal"
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
          ref={useMergeRefs(avatarRef, avatarProps.ref)}
          onChange={(e) => {
            const [file] = e.target.files;

            if (file) {
              setAvatar({ url: window.URL.createObjectURL(file) });
            }
          }}
          accept="image/*"
        />
      </FormControl>

      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input {...register('firstName')} id="firstName" placeholder="Jean-Michel" />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName}>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input {...register('lastName')} placeholder="Jam" />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          placeholder="What's your life like..."
          {...register('about')}
          resize="vertical"
          whiteSpace="pre-wrap"
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        type="submit"
        isFullWidth
        mt={3}
        colorScheme="teal"
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
