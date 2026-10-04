import { Form, useSubmit } from 'react-router';
import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button, Textarea, Grid, Field, Link as ChakraLink } from '@chakra-ui/react';

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


// Defaults as parameters: React 19 ignores defaultProps on function components.
const GameForm = ({ defaultData = {}, loading = false, ...rest }) => {
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
      encType="multipart/form-data"
      gridTemplateColumns="1fr 1fr"
      gap={5}
      method="post"
      {...rest}
      asChild><Form
        onSubmit={handleSubmit((values, event) => {
          submit(event.nativeEvent.submitter || event.currentTarget, {
            method: 'post',
            replace: true,
          });
        })}>
        <Field.Root gridColumn="1 / 3" invalid={errors.name} required>
          <Field.Label>Name<Field.RequiredIndicator /></Field.Label>
          <Input
            {...register('name')}
            placeholder="Super Tractor Simulator 2042, Assassin's Greed..."
          />
          <PossibleGameDuplicates value={newGameName} ignoredId={id} />
          <Field.ErrorText>
            {errors.name && errors.name.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.igdb_url}>
          <Field.Label>IGDB</Field.Label>
          <Input
            {...register('igdb_url')}
            placeholder="https://www.igdb.com/games/super-tractor-simulator-2042"
            type="url"
            pattern="https://www.igdb.com\/games\/(.+)"
          />
          {newGameName?.trim() && (
            <Field.HelperText>
              Find its page by{' '}
              <ChakraLink
                href={`https://www.igdb.com/search?q=${encodeURIComponent(newGameName.trim())}`}
                target="_blank"
                rel="noopener noreferrer"
                textDecoration="underline"
              >
                searching IGDB for “{newGameName.trim()}”
              </ChakraLink>
              .
            </Field.HelperText>
          )}
          <Field.ErrorText>
            {errors.igdb_url && errors.igdb_url.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.about}>
          <Field.Label>About</Field.Label>
          <Textarea
            {...register('about')}
            minH="15rem"
            resize="vertical"
            placeholder="What is it about?"
            whiteSpace="pre-wrap"
          />
          <Field.ErrorText>
            {errors.about && errors.about.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.site}>
          <Field.Label>Site</Field.Label>
          <Input
            {...register('site')}
            placeholder="https://example.com"
            type="url"
          />
          <Field.HelperText>
            The game's official website, or else its Steam or itch.io page.
          </Field.HelperText>
          <Field.ErrorText>
            {errors.site && errors.site.message}
          </Field.ErrorText>
        </Field.Root>
        <Field.Root gridColumn="1 / 3" invalid={errors.tags}>
          <Field.Label>Tags</Field.Label>
          <Input
            {...register('tags')}
            placeholder="action, mystery, multiplayer"
          />
          <Field.ErrorText>
            {errors.tags && errors.tags.message}
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
      </Form></Grid>
  );
};

GameForm.propTypes = propTypes;

export default GameForm;
