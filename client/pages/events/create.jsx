import { Box, Heading, Stack } from '@chakra-ui/core';
import { gql, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import uploadImageMutation from '../../gql/sendImage.gql';
import Navigation from '../../components/Navigation';
import EventForm from '../../components/EventForm';

const createEventMutation = gql`
  mutation createEvent(
    $name: String!
    $status: EventStatus
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
          status: $status
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
        status
        about
        cover {
          url
          thumbnail_url
        }
        locationId
        startsAt
        endsAt
      }
    }
  }
`;

const upsertLocationMutation = gql`
  mutation upsertLocation(
    $street: String
    $city: String!
    $region: String!
    $countryCode: String!
    $latitude: Float!
    $longitude: Float!
  ) {
    upsertLocationByStreetAndCityAndRegionAndCountryCodeAndLatitudeAndLongitude(
      input: {
        location: {
          street: $street
          city: $city
          region: $region
          countryCode: $countryCode
          latitude: $latitude
          longitude: $longitude
        }
        patch: {
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
  const [upsertLocation, { loading: loadingLocation }] = useMutation(
    upsertLocationMutation
  );
  const [createEvent, { loading }] = useMutation(createEventMutation);

  async function handleFormSubmit({
    name,
    status,
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

    let locationId = null;

    if (location.value && location.id) {
      locationId = location.id;
    } else if (location.value) {
      const response = await upsertLocation({
        variables: location.value,
      });

      locationId =
        response.data
          .upsertLocationByStreetAndCityAndRegionAndCountryCodeAndLatitudeAndLongitude
          .location.id;
    }

    const response = await createEvent({
      variables: {
        name,
        status,
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
