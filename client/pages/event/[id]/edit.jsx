import { Box, Heading, Stack, Spinner } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../../lib/apollo';
import uploadImageMutation from '../../../gql/sendImage.gql';
import Navigation from '../../../components/Navigation';
import EventForm from '../../../components/EventForm';

const getEventQuery = gql`
  query getEvent($id: UUID!) {
    event(id: $id) {
      id
      name
      cover {
        url
      }
      about
      site
      startsAt
      endsAt

      location {
        id
        street
        city
        region
        countryCode
        latitude
        longitude
      }
    }
  }
`;

const updateEventMutation = gql`
  mutation createEvent(
    $id: UUID!
    $name: String
    $startsAt: Datetime
    $endsAt: Datetime
    $coverId: UUID
    $about: String
    $locationId: UUID
  ) {
    updateEvent(
      input: {
        id: $id
        patch: {
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

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const EditEvent = ({id}) => {
  const validId = uuidRegex.test(id);
  const { push } = useRouter();

  const { loading, error, data } = useQuery(getEventQuery, {
    variables: { id },
    skip: !validId,
  });
  const [uploadImage, {loading: loadingCover}] = useMutation(gql(uploadImageMutation));
  const [createLocation, { loading: loadingLocation }] = useMutation(
    createLocationMutation
  );
  const [updateEvent, { loading: loadingUpdate }] = useMutation(updateEventMutation);

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

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

    if (location && !location.id) {
      const response = await createLocation({
        variables: location,
      });

      locationId = response.data.createLocation.location.id;
    }
    else {
      locationId = location.id;
    }

    const response = await updateEvent({
      variables: {
        id,
        name,
        startsAt: start,
        endsAt: end,
        coverId,
        about,
        locationId,
      },
    });

    push(`/event/${response.data.updateEvent.event.id}`);
  }

  return (
    <div>
      <Head>
        <title>Update event</title>
      </Head>

      <Navigation />

      <Box width={500} margin="40px auto">
        <Heading mb={5}>Update event</Heading>

        <Stack
          borderWidth="1px"
          mb={10}
          p={3}
          borderRadius={5}
          align="stretch"
        >
          <EventForm
            defaultData={data && data.event}
            onSubmit={handleFormSubmit}
            loading={loadingUpdate || loadingLocation || loadingCover}
          />
        </Stack>
      </Box>
    </div>
  );
};

EditEvent.getInitialProps = async context => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(EditEvent);
