import {
  Box,
  Fade,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  LinkBox,
  Spacer,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { fetch, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { scaleQuantile } from 'd3-scale';
import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import { db } from '../utils/db.server';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import countryNames from '../assets/countries.json';
import computeEvent from '../models/event';
import LinearGradient from '../components/LinearGradient';
import EventCard from '../components/EventCard';

export const loader = async ({ params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  const countryCode = params.code.toUpperCase();

  // using remix-i18n ?
  // let locale = await i18next.getLocale(request);

  // fetch country data and use right locale

  const regions =
    await db.$queryRaw`select region as name, count(e.id)::int from location l left join entity e on l.id = e.location_id where country_code = ${countryCode} group by region order by count desc`;

  const cities =
    await db.$queryRaw`select city as name, region, count(e.id)::int from location l left join entity e on l.id = e.location_id where country_code = ${countryCode} group by city, region order by count desc limit 10`;

  // country does not exist
  if (cities.length === 0) {
    return json(
      {
        error: 'Country not found',
      },
      404
    );
  }

  const upcomingEvents = await db.event.findMany({
    where: {
      status: {
        not: 'canceled',
      },
      ends_at: {
        gte: new Date(),
      },
      location: {
        country_code: countryCode,
      },
    },
    include: {
      event_participant: true,
      game_event: {
        where: {
          game: {
            deleted: false,
          },
        },
      },
      location: true,
      cover: true,
    },
    orderBy: {
      starts_at: 'asc',
    },
    take: 3,
  });

  let geoJsonUrls = [];

  if (countryCode === 'JP') {
    geoJsonUrls = new Array(47)
      .fill()
      .map(
        (d, i) =>
          `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/JP/JP-${(
            i + 1
          )
            .toString()
            .padStart(2, 0)}.geojson`
      );
  } else if (countryCode === 'FR') {
    geoJsonUrls = [
      'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson',
    ];
  } else if (countryCode === 'CH') {
    geoJsonUrls =
      // prettier-ignore
      ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH']
    .map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/CH/CH-${iso2}.geojson`
    );
  }

  const geographies = await Promise.all(
    geoJsonUrls.map((url) => fetch(url).then((r) => r.json()))
  );

  let projection;

  if (countryCode === 'JP') {
    projection = {
      scale: 1500,
      center: [138.2529, 36.2048],
    };
  } else if (countryCode === 'FR') {
    projection = {
      scale: 2800,
      center: [1.7191, 46.7111],
    };
  } else if (countryCode === 'CH') {
    projection = {
      scale: 7500,
      center: [8.2275, 46.8182],
    };
  }

  const data = {
    country: {
      code: countryCode,
      name: countryNames[countryCode],
      regions,
      cities,
      upcomingEvents: await Promise.all(upcomingEvents.map(computeEvent)),
    },
    geographies,
    projection,
  };

  return json(data);
};

export const meta = ({ data: { country } }) => ({
  title: `${country.name}'s Gaming Overview | Indie Collective - Community powered video game data`,
});

// light mode
const COLOR_RANGE_LIGHT = [
  '#C8E5D6',
  '#B2DCC4',
  '#9CD2B3',
  '#86C8A1',
  '#6FBF8F',
  '#59B57D',
  '#43AB6C',
  '#2DA25A',
  '#179848',
];

const DEFAULT_COLOR_LIGHT = '#DEEFE8';

// dark mode
const COLOR_RANGE_DARK = [
  '#1A3932',
  '#194535',
  '#195137',
  '#195D3A',
  '#18683D',
  '#187440',
  '#188042',
  '#178C45',
  '#179848',
];

const DEFAULT_COLOR_DARK = '#1A2D2F';

const CountriesPage = () => {
  const { country, geographies, projection } = useLoaderData();
  const COLOR_RANGE = useColorModeValue(COLOR_RANGE_LIGHT, COLOR_RANGE_DARK);
  const DEFAULT_COLOR = useColorModeValue(
    DEFAULT_COLOR_LIGHT,
    DEFAULT_COLOR_DARK
  );
  const bg = useColorModeValue('white', 'gray.900');

  const geographyHoverFill = useColorModeValue('#a8dd36', '#668327');
  const geographyStyle = useMemo(
    () => ({
      default: {
        outline: 'none',
      },
      hover: {
        fill: geographyHoverFill,
        transition: 'all 250ms',
        outline: 'none',
      },
      pressed: {
        outline: 'none',
      },
    }),
    [geographyHoverFill]
  );

  const { regions, cities, upcomingEvents } = country;

  const gradientData = {
    fromColor: COLOR_RANGE[0],
    toColor: COLOR_RANGE[COLOR_RANGE.length - 1],
    min: 0,
    max: regions.reduce(
      (max, item) => (item.count > max ? item.count : max),
      0
    ),
  };

  const colorScale = scaleQuantile()
    .domain(regions.map((d) => d.count))
    .range(COLOR_RANGE);

  return (
    <Box my={5} px={5}>
      <Heading as="h2" size="xl" mb={8}>
        {country.name}'s Gaming Overview
      </Heading>

      <Flex direction={{ base: 'column', md: 'row' }} mb={5}>
        <Box
          w={{ base: 'auto', md: '500px' }}
          px={4}
          py={5}
          background={bg}
          shadow="sm"
          borderRadius={7}
        >
          <Heading as="h3" size="xl" mb={5}>
            Most vibrant cities
          </Heading>

          <Stack>
            {cities.map(({ code, name, region, count }) => (
              <LinkBox key={code}>
                <HStack>
                  <Heading size={{ base: 'sm', md: 'md' }}>
                    {name}, {region}
                  </Heading>
                  <Spacer />
                  <Heading size={{ base: 'sm', md: 'md' }}>{count}</Heading>
                </HStack>
                <Box
                  style={{
                    width: `${(count / cities[0].count) * 100}%`,
                  }}
                  h="10px"
                  bgColor="blue.500"
                  mb={2}
                />
              </LinkBox>
            ))}
          </Stack>
        </Box>

        <Box w={{ base: '100%', md: '600px' }} m="auto" textAlign="center">
          {geographies ? (
            <>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={projection}
                width={800}
                height={800}
              >
                {country.code === 'JP' && (
                  <Geographies
                    geography={geographies}
                    parseGeographies={(geos) => {
                      console.log(geos);
                      return geos;
                    }}
                  >
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const region = regions.find(
                          (item) =>
                            item.name.replace(' Prefecture', '') ===
                            geo.properties.name.replace(' Prefecture', '')
                        );
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              region ? colorScale(region.count) : DEFAULT_COLOR
                            }
                            style={geographyStyle}
                          />
                        );
                      })
                    }
                  </Geographies>
                )}
                {country.code === 'CH' && (
                  <Geographies
                    geography={geographies}
                    parseGeographies={(geos) => {
                      console.log(geos);
                      return geos;
                    }}
                  >
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const region = regions.find(
                          (item) => item.name === geo.properties.name
                        );
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              region ? colorScale(region.count) : DEFAULT_COLOR
                            }
                            style={geographyStyle}
                          />
                        );
                      })
                    }
                  </Geographies>
                )}
                {country.code === 'FR' && (
                  <Geographies
                    geography={geographies[0]}
                    parseGeographies={(geos) => {
                      console.log(geos);
                      return geos;
                    }}
                  >
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const region = regions.find(
                          (item) => item.name === geo.properties.nom
                        );
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              region ? colorScale(region.count) : DEFAULT_COLOR
                            }
                            style={geographyStyle}
                          />
                        );
                      })
                    }
                  </Geographies>
                )}
              </ComposableMap>
              <LinearGradient data={gradientData} />
            </>
          ) : (
            <Box>No map for now.</Box>
          )}
        </Box>
      </Flex>

      <Box px={4} py={5} background={bg} shadow="sm" borderRadius={7}>
        <Heading as="h3" size="xl" mb={5}>
          Upcoming events
        </Heading>

        <Fade in>
          {upcomingEvents.length > 0 ? (
            <Grid
              gap={3}
              templateColumns={[
                '1fr',
                'repeat(2, 1fr)',
                'repeat(3, 1fr)',
                'repeat(3, 1fr)',
              ]}
            >
              {upcomingEvents.map((event) => (
                <Box key={event.id} minW={0}>
                  <EventCard {...event} />
                </Box>
              ))}
            </Grid>
          ) : (
            <Box mt={5} width={['auto', '50%', '35%', '25%']} mx="auto">
              <Image src={noEventsImage} alt="" />
              <Text fontSize="xl" mt={5} textAlign="center">
                No upcoming events yet, sadly.
              </Text>
            </Box>
          )}
        </Fade>
      </Box>
    </Box>
  );
};

export default CountriesPage;
