import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Field,
  Input,
  Button,
  Textarea,
  Avatar,
  IconButton,
  InputGroup,
  Spinner,
} from '@chakra-ui/react';
import { useMergeRefs } from '../hooks/useMergeRefs';
import { FiCheck, FiX, FiEdit } from 'react-icons/fi';
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
      <Field.Root mb={5}>
        <Field.Label htmlFor="avatar" textAlign="center">
          <Avatar size="2xl" margin="1rem" src={avatar}>
            <Avatar.Badge size="1em" bg="white">
              <IconButton
                aria-label="Edit avatar"
                icon={<FiEdit />}
                colorScheme="teal"
                borderRadius="full"
                onClick={() => avatarRef.current.click()}
              />
            </Avatar.Badge>
          </Avatar>
        </Field.Label>

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
      </Field.Root>

      <Field.Root mb={5}>
        <Field.Label htmlFor="email">Email</Field.Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jmj@indieco.xyz"
          value={email}
          disabled
        />
      </Field.Root>

      <Field.Root mb={5}>
        <Field.Label htmlFor="username">Username</Field.Label>
        <InputGroup>
          <Input
            {...register('username', {
              onChange: e => checkUsernameAvailability(e.target.value),
            })}
            id="username"
            placeholder="jeanmicheljam"
          />
          {fetcher.data && (
            <Input.RightElement
              children={
                fetcher.state === 'loading' ? (
                  <Spinner />
                ) : fetcher.data.available ? (
                  <FiCheck color="green.500" />
                ) : (
                  <FiX color="red.500" />
                )
              }
            />
          )}
        </InputGroup>
        <Field.ErrorText>
          {errors.username && errors.username.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root mb={5} isInvalid={errors.firstName} isRequired>
        <Field.Label htmlFor="firstName">First name</Field.Label>
        <Input
          {...register('firstName')}
          id="firstName"
          placeholder="Jean-Michel"
        />
        <Field.ErrorText>
          {errors.firstName && errors.firstName.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root mb={5} isInvalid={errors.lastName}>
        <Field.Label htmlFor="lastName">Last name</Field.Label>
        <Input {...register('lastName')} id="lastName" placeholder="Jam" />
        <Field.ErrorText>
          {errors.lastName && errors.lastName.message}
        </Field.ErrorText>
      </Field.Root>

      <Field.Root mb={5} isInvalid={errors.about}>
        <Field.Label htmlFor="about">About</Field.Label>
        <Textarea
          id="about"
          placeholder="What's your life like..."
          {...register('about')}
          resize="vertical"
          whiteSpace="pre-wrap"
        />
        <Field.ErrorText>
          {errors.about && errors.about.message}
        </Field.ErrorText>
      </Field.Root>

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
