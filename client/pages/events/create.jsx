import { Box, Heading, Stack } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import EventForm from '../../components/EventForm';

const createEventMutation = gql`
  mutation createEvent(
    $name: String!
    $startsAt: Datetime!
    $endsAt: Datetime!
    $coverId: UUID
    $about: String
    $locationId: UUID
  ) {
    createEvent(
      input: {
        event: {
          name: $name
          about: $about
          coverId: $coverId
          locationId: $locationId
          startsAt: $startsAt
          endsAt: $endsAt
        }
      }
    ) {
      event {
        id
        name
        about
        locationId
        startsAt
        endsAt
      }
    }
  }
`;

const createLocationMutation = gql`
  mutation createLocation(
    $street: String
    $city: String!
    $region: String!
    $countryCode: String!
    $latitude: Float!
    $longitude: Float!
  ) {
    createLocation(
      input: {
        location: {
          street: $street
          city: $city
          region: $region
          countryCode: $countryCode
          latitude: $latitude
          longitude: $longitude
        }
      }
    ) {
      location {
        id
        countryCode
        region
        city
        latitude
        longitude
      }
    }
  }
`;

const CreateEvent = () => {
  const { push } = useRouter();

  const [uploadImage, { loading: loadingCover }] = useMutation(
    gql(uploadImageMutation)
  );
  const [createLocation, { loading: loadingLocation }] = useMutation(
    createLocationMutation
  );
  const [createEvent, { loading }] = useMutation(createEventMutation);

  async function handleFormSubmit({
    name,
    about,
    start,
    end,
    location,
    cover: coverFiles,
  }) {
    let coverId;

    if (coverFiles[0]) {
      const response = await uploadImage({
        variables: {
          file: coverFiles[0],
        },
      });

      coverId = response.data.createImage.image.id;
    }

    let locationId;

    if (location) {
      let variables;

      if (location.type === 'city') {
        variables = {
          city: location.name,
        };
      } else {
        variables = {
          street: location.name,
          city: location.city,
        };
      }

      const response = await createLocation({
        variables: {
          ...variables,
          region: location.administrative,
          countryCode: location.countryCode.toUpperCase(),
          latitude: location.latlng.lat,
          longitude: location.latlng.lng,
        },
      });

      locationId = response.data.createLocation.location.id;
    }

    const response = await createEvent({
      variables: {
        name,
        startsAt: start,
        endsAt: end,
        coverId,
        about,
        locationId,
      },
    });

    push(`/event/${response.data.createEvent.event.id}`);
  }

  return (
    <div>
      <Head>
        <title>Create a new event</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Create event</Heading>

        <Stack borderWidth="1px" mb={10} p={3} borderRadius={5} align="stretch">
          <EventForm
            onSubmit={handleFormSubmit}
            loading={loading || loadingLocation || loadingCover}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateEvent);
