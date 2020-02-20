import { Box, Heading } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { withApollo } from '../../lib/apollo';
import Navigation from '../../components/Navigation';
import EventForm from '../../components/EventForm';

const createEventMutation = gql`
  mutation createEvent(
    $name: String!
    $about: String
    $locationId: UUID!
    $startsAt: Datetime!
    $endsAt: Datetime!
  ) {
    createEvent(
      input: {
        event: {
          name: $name
          about: $about
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

const locationKey = (country, region, city) => `${country}:${region}:${city}`;

const CreateEvent = () => {
  const router = useRouter();

  const [createLocation] = useMutation(createLocationMutation);
  const [createEvent] = useMutation(createEventMutation);

  const [locationId, setLocationId] = useState();
  const [currentLocationKey, setLocationKey] = useState();

  function handleFormSubmit({
    name,
    about,
    start,
    end,
    country,
    region,
    city,
  }) {
    console.log(name, about, start, end, country, region, city);
    if (
      !locationId ||
      currentLocationKey !== locationKey(country, region, city)
    ) {
      createLocation({
        variables: {
          country,
          region,
          city,
        },
      })
        .then(response => {
          setLocationId(response.data.createLocation.location.id);
          setLocationKey(locationKey(country, region, city));

          createEvent({
            variables: {
              locationId: response.data.createLocation.location.id,
              name,
              about,
              startsAt: start,
              endsAt: end,
            },
          }).then(eventResponse => {
            router.push(`/event/${eventResponse.data.createEvent.event.id}`);
          });
        });
    } else {
      createEvent({
        variables: {
          name,
          about,
          locationId,
          startsAt: start,
          endsAt: end,
        },
      }).then(eventResponse => {
        router.push(`/event/${eventResponse.data.createEvent.event.id}`);
      });
    }
  }

  return (
    <div>
      <Head>
        <title>Create a new event</title>
      </Head>

      <Navigation />

      <Box maxW="32rem">
        <Heading mb={4}>Create event</Heading>
        <EventForm onSubmit={handleFormSubmit} />
      </Box>
    </div>
  );
};

export default withApollo()(CreateEvent);