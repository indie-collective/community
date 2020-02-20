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
  mutation createLocation($country: String!, $region: String!, $city: String!) {
    createLocation(
      input: { location: { country: $country, region: $region, city: $city } }
    ) {
      location {
        id
        country
        region
        city
      }
    }
  }
`;

const CreateEvent = () => {
  const { push } = useRouter();

  const [uploadImage] = useMutation(gql(uploadImageMutation));
  const [createLocation, { loading: loadingLocation }] = useMutation(
    createLocationMutation
  );
  const [createEvent, { loading }] = useMutation(createEventMutation);

  async function handleFormSubmit({
    name,
    about,
    start,
    end,
    cover: coverFiles,
    country,
    region,
    city,
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

    if (!locationId && country && region && city) {
      const response = await createLocation({
        variables: {
          country,
          region,
          city,
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

        <Stack
          border="1px solid #eee"
          mb={10}
          p={3}
          borderRadius={5}
          align="stretch"
        >
          <EventForm
            onSubmit={handleFormSubmit}
            loading={loading || loadingLocation}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default withApollo()(CreateEvent);
