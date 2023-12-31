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
import { Prisma } from '@prisma/client';
import { fetch, json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  geoAlbersUk,
  geoAlbersUsaTerritories,
  geoConicConformalFrance,
  geoConicConformalSpain,
  geoConicEquidistantJapan,
} from 'd3-composite-projections';
import { geoMercator, geoBounds, geoPath } from 'd3-geo';
import { scaleQuantile } from 'd3-scale';
import { isArray } from 'lodash';
import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

import { db } from '../utils/db.server';
import noEventsImage from '../assets/undraw_festivities_tvvj.svg';
import countryNames from '../assets/countries.json';
import computeEvent from '../models/event';
import LinearGradient from '../components/LinearGradient';
import EventCard from '../components/EventCard';

// according to https://en.wikipedia.org/wiki/ISO_3166-2#Subdivisions_included_in_ISO_3166-1
const countryCodesWithSubdivisions = {
  CN: ['TW', 'HK', 'MO'],
  FI: ['AX'],
  FR: ['BL', 'GF', 'GP', 'MF', 'MQ', 'NC', 'PF', 'PM', 'RE', 'TF', 'WF', 'YT'],
  NL: ['AW', 'BQ', 'CW', 'SX'],
  NO: ['SJ'],
  US: ['AS', 'GU', 'MP', 'PR', 'UM', 'VI'],
};

const countryCodesWithRegionsGeojson = {
  BE:
    // prettier-ignore
    ['BRU', 'VAN', 'VOV', 'VBR', 'WHT', 'VLI', 'WLG', 'WLX', 'WNA', 'WBR', 'VWV'].map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/BE/BE-${iso2}.geojson`
    ),
  CA:
    // prettier-ignore
    ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/CA/CA-${iso2}.geojson`
    ),
  CH:
    // prettier-ignore
    ['AG','AI','AR','BE','BL','BS','FR','GE','GL','GR','JU','LU','NE','NW','OW','SG','SH','SO','SZ','TG','TI','UR','VD','VS','ZG','ZH'].map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/CH/CH-${iso2}.geojson`
    ),
  CN:
    // prettier-ignore
    ['AH', 'BJ', 'CQ', 'FJ', 'GS', 'GD', 'GX', 'GZ', 'HI', 'HE', 'HL', 'HA', 'HB', 'HN', 'NM', 'JS', 'JX', 'JL', 'LN', 'NX', 'QH', 'SN', 'SD', 'SH', 'SX', 'SC', 'TJ', 'XZ', 'XJ', 'YN', 'ZJ']
    .map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/CN/CN-${iso2}.geojson`
    ),
  DE: [
    'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/germany.geojson',
  ],
  ES:
    // prettier-ignore
    // ['AN', 'AR', 'AS', 'IB', 'PV', 'CN', 'CB', 'CL', 'CM', 'CT', 'CE', 'MD', 'EX', 'GA', 'ML', 'NC', 'MC', 'RI', 'VC']
    ['C', 'A', 'AB', 'AL', 'O', 'BA', 'PM', 'B', 'BI', 'BU', 'S', 'CS', 'CR', 'M', 'CO', 'CU', 'CC', 'CA', 'SS', 'GI', 'GR', 'GU', 'HU', 'J', 'GC', 'LE', 'L', 'LU', 'MA', 'NA', 'OR', 'P', 'PO', 'MU', 'LO', 'SA', 'TF', 'SG', 'SE', 'SO', 'T', 'TO', 'V', 'VA', 'ZA', 'Z', 'VI', 'AV']
    .map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/ES/ES-${iso2}.geojson`
    ),
  FR: [
    'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-avec-outre-mer.geojson',
  ],
  GB:
    // prettier-ignore
    // ['ABE', 'ABD', 'ANS', 'AGB', 'BAS', 'BDF', 'BBD', 'BPL', 'BGW', 'XBCP', 'BRC', 'BGE', 'BNH', 'BKM', 'CAY', 'CAM', 'CRF', 'CMN', 'CBF', 'CGN', 'CHE', 'CHW', 'BST', 'EDH', 'LCE', 'LND', 'NGM', 'PTE', 'CLK', 'CWY', 'CON', 'DUR', 'CMA', 'DAL', 'DEN', 'DER', 'DBY', 'DEV', 'DOR', 'DGY', 'DND', 'EAY', 'EDU', 'ELN', 'ERW', 'ERY', 'ESX', 'ESS', 'FAL', 'FIF', 'FLN', 'GLG', 'GLS', 'GWN', 'HAL', 'HAM', 'HPL', 'HEF', 'HRT', 'HLD', 'IVC', 'AGY', 'IOW', 'IOS', 'KEN', 'KHL', 'LAN', 'LEC', 'LIN', 'LUT', 'MDW', 'MTY', 'MDB', 'MLN', 'MIK', 'MON', 'MRY', 'NTL', 'NWP', 'NFK', 'NAY', 'NEL', 'NLK', 'NLN', 'NSM', 'NYK', 'NTH', 'NBL', 'NTT', 'ORK', 'OXF', 'PEM', 'PKN', 'PLY', 'POR', 'POW', 'RDG', 'RCC', 'RFW', 'RCT', 'RUT', 'SCB', 'ZET', 'SHR', 'SLG', 'SOM', 'SAY', 'SGC', 'SLK', 'STH', 'SOS', 'STS', 'STG', 'STT', 'STE', 'SFK', 'SRY', 'SWA', 'SWD', 'TFW', 'THR', 'TOB', 'TOF', 'VGL', 'WRT', 'WAR', 'WBK', 'WDU', 'WLN', 'WSX', 'ELS', 'WIL', 'WNM', 'WOK', 'WOR', 'WRX', 'YOR']
    ['ENG', 'NIR', 'SCT', 'WLS'].map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/GB/GB-${iso2}.geojson`
    ),
  IE:
    // prettier-ignore
    ['CE', 'CN', 'CO', 'CW', 'D', 'DL', 'G', 'KE', 'KK', 'KY', 'LD', 'LH', 'LK', 'LM', 'LS', 'MH', 'MN', 'MO', 'OY', 'RN', 'SO', 'TA', 'WD', 'WH', 'WW', 'WX']
    .map(iso2 => `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/IE/IE-${iso2}.geojson`),
  IT: [
    'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/italy-provinces.geojson',
  ],
  JP: new Array(47)
    .fill()
    .map(
      (d, i) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/JP/JP-${(
          i + 1
        )
          .toString()
          .padStart(2, 0)}.geojson`
    ),
  TW: [
    'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/taiwan.geojson',
  ],
  US:
    // prettier-ignore
    ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'VI', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(
      (iso2) =>
        `https://raw.githubusercontent.com/hyperknot/country-levels-export/master/geojson/medium/iso2/US/US-${iso2}.geojson`
    ),
};

const countryCodeProjections = {
  ES: geoConicConformalSpain(),
  FR: geoConicConformalFrance(),
  JP: geoConicEquidistantJapan(),
  US: geoAlbersUsaTerritories(),
  GB: geoAlbersUk(),
};

export const loader = async ({ params }) => {
  if (!params.code) {
    return redirect('/countries');
  }

  const countryCode = params.code.toUpperCase();

  // joining subdivisions that have their own country code
  const countryCodes = [
    countryCode,
    ...(countryCodesWithSubdivisions[countryCode] || []),
  ];

  // using remix-i18n ?
  // let locale = await i18next.getLocale(request);

  // fetch country data and use right locale

  const regions =
    await db.$queryRaw`select region as name, count(e.id)::int from location l left join entity e on l.id = e.location_id where country_code in (${Prisma.join(
      countryCodes
    )}) group by region order by count desc`;

  // country does not exist
  if (regions.length === 0) {
    throw new Response('Not Found', {
      status: 404,
    });
  }

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

  // getting regions geojson
  let geoJsonUrls = countryCodesWithRegionsGeojson[countryCode] || [];

  const geographies = await Promise.all(
    geoJsonUrls.map((url) => fetch(url).then((r) => r.json()))
  );

  let projection;

  const enabledCountries = Object.keys(countryCodesWithRegionsGeojson);

  if (
    enabledCountries.includes(countryCode) &&
    !countryCodeProjections[countryCode]
  ) {
    const regionsFeature =
      isArray(geographies) && geographies.length === 1
        ? geographies[0]
        : {
            type: 'FeatureCollection',
            features: geographies,
          };

    // const center = geoCentroid(regionsFeature);
    const bounds = geoPath(geoMercator().scale(1)).bounds(regionsFeature);

    const mapWidth = 960;
    const mapHeight = 500;

    const scale =
      0.95 /
      Math.max(
        (bounds[1][0] - bounds[0][0]) / mapWidth,
        (bounds[1][1] - bounds[0][1]) / mapHeight
      );

    const bbox = geoBounds(regionsFeature);
    const center = [
      (bbox[1][0] + bbox[0][0]) / 2,
      (bbox[1][1] + bbox[0][1]) / 2,
    ];

    projection = { scale, center };
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

export const meta = ({ data }) => {
  if (!data?.country)
    return {
      title: 'Country Not Found',
    };

  const { country } = data;

  return {
    title: `${country.name}'s Gaming Overview | Indie Collective - Community powered video game data`,
  };
};

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
          w={{ base: 'auto', md: '600px' }}
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

        <Box w="100%" m="auto" textAlign="center">
          {geographies ? (
            <>
              <ComposableMap
                projection={
                  countryCodeProjections[country.code] || 'geoMercator'
                }
                projectionConfig={projection}
                width={960}
                height={500}
              >
                <Geographies
                  geography={
                    isArray(geographies) && geographies.length === 1
                      ? geographies[0]
                      : geographies
                  }
                  parseGeographies={(geos) => {
                    console.log(geos);
                    return geos;
                  }}
                >
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const region = regions.find((item) => {
                        if (country.code === 'FR') {
                          return item.name === geo.properties.nom;
                        }

                        if (country.code === 'JP') {
                          return (
                            item.name.replace(' Prefecture', '') ===
                            geo.properties.name.replace(' Prefecture', '')
                          );
                        }

                        return item.name === geo.properties.name;
                      });
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
