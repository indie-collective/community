import { Box, Heading, Spinner } from '@chakra-ui/react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Error from '../../_error';
import { withApollo } from '../../../lib/apollo';
import uploadImageMutation from '../../../gql/sendImage.gql';
import Navigation from '../../../components/Navigation';
import EventForm from '../../../components/EventForm';

const getEventQuery = gql`
  query getEvent($id: UUID!) {
    event(id: $id) {
      id
      name
      status
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
    $status: EventStatus
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
        location {
          id
          street
          city
          region
          countryCode
          latitude
          longitude
        }
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

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const EditEvent = ({ id }) => {
  const validId = uuidRegex.test(id);
  const { push } = useRouter();

  const { loading, error, data } = useQuery(getEventQuery, {
    variables: { id },
    skip: !validId,
  });
  const [uploadImage, { loading: loadingCover }] = useMutation(
    gql(uploadImageMutation)
  );
  const [upsertLocation, { loading: loadingLocation }] = useMutation(
    upsertLocationMutation
  );
  const [updateEvent, { loading: loadingUpdate }] = useMutation(
    updateEventMutation
  );

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

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

    const response = await updateEvent({
      variables: {
        id,
        name,
        status,
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

      <Box width={{ base: 'auto', sm: 500 }} margin="40px auto" p={5} mb={5}>
        <Heading mb={5}>Update event</Heading>
        <EventForm
          defaultData={data && data.event}
          onSubmit={handleFormSubmit}
          loading={loadingUpdate || loadingLocation || loadingCover}
        />
      </Box>
    </div>
  );
};

EditEvent.getInitialProps = async (context) => {
  const { id } = context.query;

  return {
    id,
  };
};

export default withApollo({ ssr: true })(EditEvent);
