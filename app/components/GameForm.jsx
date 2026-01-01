import { Form, useSubmit } from '@remix-run/react';
import React from 'react';
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
} from '@chakra-ui/react';

import PossibleGameDuplicates from '../components/PossibleGameDuplicates';

const validationSchema = yup.object().shape({
  name: yup.string().required(),
  about: yup.string(),
  site: yup.string().url(),
});

const propTypes = {
  loading: PropTypes.bool.isRequired,
  defaultData: PropTypes.shape({
    name: PropTypes.string,
    about: PropTypes.string,
    site: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.any),
    tags: PropTypes.arrayOf(PropTypes.any),
  }),
};

const defaultProps = {
  loading: false,
  defaultData: {},
};

const GameForm = ({ defaultData, loading, ...rest }) => {
  const submit = useSubmit();
  const { id, name, igdb_url, about, site, tags = [] } = defaultData;
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name,
      igdb_url,
      about,
      site,
      tags: tags.map((t) => t.name).join(', '),
    },
  });

  const newGameName = watch('name');

  return (
    <Grid
      as={Form}
      encType="multipart/form-data"
      gridTemplateColumns="1fr 1fr"
      gap={5}
      method="post"
      onSubmit={handleSubmit((values, event) => {
        submit(event.nativeEvent.submitter || event.currentTarget, {
          method: 'post',
          replace: true,
        });
      })}
      {...rest}
    >
      <FormControl gridColumn="1 / 3" isInvalid={errors.name} isRequired>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          {...register('name')}
          placeholder="Super Tractor Simulator 2042, Assassin's Greed..."
        />
        <PossibleGameDuplicates value={newGameName} ignoredId={id} />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.name}>
        <FormLabel htmlFor="igdb_url">IGDB</FormLabel>
        <Input
          {...register('igdb_url')}
          placeholder="https://www.igdb.com/games/super-tractor-simulator-2042"
          type="url"
          pattern="https://www.igdb.com\/games\/(.+)"
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.about}>
        <FormLabel htmlFor="about">About</FormLabel>
        <Textarea
          {...register('about')}
          minH="15rem"
          resize="vertical"
          placeholder="What is it about?"
          whiteSpace="pre-wrap"
        />
        <FormErrorMessage>
          {errors.about && errors.about.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.site}>
        <FormLabel htmlFor="site">Site</FormLabel>
        <Input
          {...register('site')}
          placeholder="https://example.com"
          type="url"
        />
        <FormErrorMessage>
          {errors.site && errors.site.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl gridColumn="1 / 3" isInvalid={errors.tags}>
        <FormLabel htmlFor="site">Tags</FormLabel>
        <Input
          {...register('tags')}
          placeholder="action, mystery, multiplayer"
        />
        <FormErrorMessage>
          {errors.tags && errors.tags.message}
        </FormErrorMessage>
      </FormControl>

      <Button
        gridColumn="1 / 3"
        colorScheme="green"
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

GameForm.propTypes = propTypes;
GameForm.defaultProps = defaultProps;

export default GameForm;
