import { Badge, Box, Button, HStack, Link as ChakraLink, Stack, Text } from '@chakra-ui/react';
import { LuExternalLink, LuGlobe, LuMapPin } from 'react-icons/lu';
import { useFetcher } from 'react-router';

import countryNames from '../assets/countries.json';
import Link from './Link';
import { opportunityKindLabel } from '../utils/opportunities';

const endDate = (date) =>
  new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/**
 * Opportunities as a list (#345): what, for whom, where, until when, and
 * where to apply. Their author and admins can take one down.
 */
const OpportunityList = ({ opportunities, currentUser, showFor = true }) => {
  const fetcher = useFetcher();
  return (
    <Stack gap={3}>
      {opportunities.map((opportunity) => {
        const place = [opportunity.city, countryNames[opportunity.country_code]].filter(Boolean).join(', ');
        const canRemove = currentUser && (currentUser.isAdmin || currentUser.id === opportunity.author_id);
        return (
          <Box key={opportunity.id} id={opportunity.id} p={4} borderWidth="1px" borderRadius="lg" data-testid="opportunity">
            <HStack gap={2} wrap="wrap" mb={1}>
              <Badge colorPalette="purple">{opportunityKindLabel(opportunity.kind)}</Badge>
              <Text fontSize="sm" color="muted">
                Until {endDate(opportunity.ends_at)}
              </Text>
            </HStack>
            <Text fontWeight="semibold" fontSize="lg">
              {opportunity.title}
            </Text>
            <HStack gap={4} wrap="wrap" fontSize="sm" color="muted" mt={1}>
              {showFor && opportunity.for && (
                <ChakraLink asChild>
                  <Link to={opportunity.for.path}>{opportunity.for.name}</Link>
                </ChakraLink>
              )}
              {place && (
                <HStack gap={1}>
                  <LuMapPin />
                  <Text>{place}</Text>
                </HStack>
              )}
              {opportunity.remote && (
                <HStack gap={1}>
                  <LuGlobe />
                  <Text>Remote</Text>
                </HStack>
              )}
            </HStack>
            {opportunity.about && (
              <Text mt={2} whiteSpace="pre-wrap" lineClamp={6}>
                {opportunity.about}
              </Text>
            )}
            <HStack mt={3} gap={2}>
              {opportunity.link && (
                <Button asChild size="sm" colorPalette="green">
                  <a href={opportunity.link} target="_blank" rel="noopener noreferrer">
                    Apply or find out more
                    <LuExternalLink />
                  </a>
                </Button>
              )}
              {canRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  loading={fetcher.state !== 'idle'}
                  onClick={() =>
                    fetcher.submit({}, { method: 'post', action: `/opportunities/${opportunity.id}/delete` })
                  }
                >
                  Take down
                </Button>
              )}
            </HStack>
          </Box>
        );
      })}
    </Stack>
  );
};

export default OpportunityList;
