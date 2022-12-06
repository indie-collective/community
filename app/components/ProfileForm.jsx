import React, { useCallback, useRef, useState } from 'react';
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
  InputGroup,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon } from '@chakra-ui/icons';
import { Form, useFetcher, useSubmit } from '@remix-run/react';
import debounce from 'lodash.debounce';

const validationSchema = yup.object().shape({
  username: yup.string().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  about: yup.string(),
});

const propTypes = {
  loading: PropTypes.bool,
  defaultData: PropTypes.shape({
    username: PropTypes.any,
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

const ProfileForm = ({ loading, defaultData, ...rest }) => {
  const avatarRef = useRef();
  const {
    email,
    username,
    first_name: firstName,
    last_name: lastName,
    about,
  } = defaultData;
  const [avatar, setAvatar] = useState(defaultData.avatar);
  const submit = useSubmit();
  const fetcher = useFetcher();
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username,
      firstName,
      lastName,
      about,
    },
  });

  const avatarProps = register('avatar');

  const checkUsernameAvailability = useCallback(
    debounce((newUsername) => {
      fetcher.load(`/check-username-availability?q=${newUsername}`);
    }, 300),
    [fetcher]
  );

  return (
    <Form
      method="post"
      onSubmit={handleSubmit((values, event) => {
        submit(event.nativeEvent.submitter || event.currentTarget, {
          method: 'post',
          replace: true,
        });
      })}
      {...rest}
      encType="multipart/form-data"
    >
      <FormControl mb={5}>
        <FormLabel htmlFor="avatar" textAlign="center">
          <Avatar size="2xl" margin="1rem" src={avatar}>
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
              setAvatar(window.URL.createObjectURL(file));
            }
          }}
          accept="image/*"
        />
      </FormControl>

      <FormControl mb={5}>
        <FormLabel htmlFor="email">Email</FormLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jmj@indieco.xyz"
          value={email}
          disabled
        />
      </FormControl>

      <FormControl mb={5}>
        <FormLabel htmlFor="username">Username</FormLabel>
        <InputGroup>
          <Input
            {...register('username', {
              onChange: e => checkUsernameAvailability(e.target.value),
            })}
            id="username"
            placeholder="jeanmicheljam"
          />
          {fetcher.data && (
            <InputRightElement
              children={
                fetcher.state === 'loading' ? (
                  <Spinner />
                ) : fetcher.data.available ? (
                  <CheckIcon color="green.500" />
                ) : (
                  <CloseIcon color="red.500" />
                )
              }
            />
          )}
        </InputGroup>
        <FormErrorMessage>
          {errors.username && errors.username.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.firstName} isRequired>
        <FormLabel htmlFor="firstName">First name</FormLabel>
        <Input
          {...register('firstName')}
          id="firstName"
          placeholder="Jean-Michel"
        />
        <FormErrorMessage>
          {errors.firstName && errors.firstName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.lastName}>
        <FormLabel htmlFor="lastName">Last name</FormLabel>
        <Input {...register('lastName')} id="lastName" placeholder="Jam" />
        <FormErrorMessage>
          {errors.lastName && errors.lastName.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl mb={5} isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          id="about"
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
        w="100%"
        mt={3}
        colorScheme="teal"
        isDisabled={loading}
        isLoading={loading}
      >
        Save
      </Button>
    </Form>
  );
};

ProfileForm.propTypes = propTypes;
ProfileForm.defaultProps = defaultProps;

export default ProfileForm;
