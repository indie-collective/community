import React, { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Input,
  Button,
  Textarea,
  Avatar,
  IconButton,
  InputGroup,
  Spinner,
  Field,
  Circle,
  Float,
} from '@chakra-ui/react';
import { LuCheck, LuX, LuPencil } from 'react-icons/lu';
import { Form, useFetcher, useSubmit } from 'react-router';
import debounce from 'lodash.debounce';
import useMergeRefs from '../hooks/useMergeRefs';

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
      <Field.Root mb={5} alignItems="center">
        <Field.Label htmlFor="avatar">
          <Avatar.Root size="2xl" margin="1rem">
            <Avatar.Fallback />
            <Avatar.Image src={avatar} />
            <Float placement="bottom-end" offsetX="1" offsetY="1">
              <IconButton
                aria-label="Edit avatar"
                colorPalette="green"
                rounded="full"
                onClick={() => avatarRef.current.click()}
              >
                <LuPencil />
              </IconButton>
            </Float>
          </Avatar.Root>
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
        <InputGroup
          endElement={
            fetcher.data &&
            (fetcher.state === 'loading' ? (
              <Spinner />
            ) : fetcher.data.available ? (
              <LuCheck color="green.500" />
            ) : (
              <LuX color="red.500" />
            ))
          }
        >
          <Input
            {...register('username', {
              onChange: (e) => checkUsernameAvailability(e.target.value),
            })}
            id="username"
            placeholder="jeanmicheljam"
          />
        </InputGroup>
        <Field.ErrorText>
          {errors.username && errors.username.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.firstName} required>
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
      <Field.Root mb={5} invalid={errors.lastName}>
        <Field.Label htmlFor="lastName">Last name</Field.Label>
        <Input {...register('lastName')} id="lastName" placeholder="Jam" />
        <Field.ErrorText>
          {errors.lastName && errors.lastName.message}
        </Field.ErrorText>
      </Field.Root>
      <Field.Root mb={5} invalid={errors.about}>
        <Field.Label htmlFor="about">About</Field.Label>
        <Textarea
          id="about"
          placeholder="What's your life like..."
          {...register('about')}
          resize="vertical"
          whiteSpace="pre-wrap"
          minH="100px"
        />
        <Field.ErrorText>
          {errors.about && errors.about.message}
        </Field.ErrorText>
      </Field.Root>
      <Button
        type="submit"
        w="100%"
        mt={3}
        colorPalette="green"
        disabled={loading}
        loading={loading}
      >
        Save
      </Button>
    </Form>
  );
};

ProfileForm.propTypes = propTypes;
ProfileForm.defaultProps = defaultProps;

export default ProfileForm;
