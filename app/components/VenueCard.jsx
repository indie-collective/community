import { Heading, Icon, Text, Flex } from '@chakra-ui/react';
import { LuMapPin } from 'react-icons/lu';

import countryNames from '../assets/countries.json';
import Card from './Card';
import CardLink from './CardLink';
import { venuePath } from '../utils/slug';

/** A venue (#390): its name, and the city and country it's in. */
const VenueCard = ({ id, slug, name, location }) => {
  const place = [location?.city, countryNames[location?.country_code]].filter(Boolean).join(', ');
  return (
    <Card isClickable padding={3} rounded="card">
      <Heading as="h3" size="md" lineClamp={2}>
        <CardLink to={venuePath({ id, slug })}>{name}</CardLink>
      </Heading>
      {place && (
        <Flex as={Text} mt={1} align="center" gap={1} color="muted" fontSize="sm">
          <Icon>
            <LuMapPin />
          </Icon>
          {place}
        </Flex>
      )}
    </Card>
  );
};

export default VenueCard;
