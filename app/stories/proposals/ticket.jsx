import { Box, Flex, Text } from '@chakra-ui/react';

import Card from '../../components/Card';
import CardLink from '../../components/CardLink';
import { formatEventDay } from '../../utils/eventTime';

// The punched holes of a perforation, cut out of the ticket with a mask
// rather than painted over it in the page colour. A box shadow would be
// masked away too, so the shadow is a drop shadow on a wrapper: it follows
// the ticket's outline, notches included.
export const notches = (at) => {
  const cut = (pos) => `radial-gradient(circle 8px at ${pos}, transparent 7.5px, #000 8px)`;
  const masks = at.map(cut).join(', ');
  return {
    maskImage: masks,
    WebkitMaskImage: masks,
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };
};

export const Ticket = ({ notchAt, columns, children }) => (
  <Box
    filter="drop-shadow(0 1px 2px rgba(16, 32, 29, 0.10)) drop-shadow(0 8px 18px rgba(16, 32, 29, 0.10))"
    transition="transform 200ms ease-out"
    _hover={{ transform: 'translateY(-4px) rotate(-0.8deg)' }}
  >
    <Card
      isClickable
      display={columns ? 'grid' : 'block'}
      gridTemplateColumns={columns}
      bg="surface"
      rounded="xl"
      overflow="hidden"
      _hover={{}}
      css={notches(notchAt)}
    >
      {children}
    </Card>
  </Box>
);

export const STUB = 74;
export const stubNotches = [`${STUB}px 0`, `${STUB}px 100%`];

export const Stub = ({ event }) => {
  const day = formatEventDay(event.starts_at, event.time_zone, { locale: 'en' });
  return (
    <Flex direction="column" align="center" justify="center" py={3}>
      <Text fontFamily="heading" fontWeight="600" fontSize="3xl" lineHeight="1">
        {day?.day}
      </Text>
      <Text fontSize="xs" fontWeight="semibold" color="brandDeep">
        {day?.month}
      </Text>
    </Flex>
  );
};

export const Meta = ({ name, starts_at, time_zone, location, slug, id }) => {
  const day = formatEventDay(starts_at, time_zone, { locale: 'en' });
  return (
    <Box minW={0}>
      <Text fontWeight="semibold" fontSize="lg" lineHeight="1.2" lineClamp={2}>
        <CardLink to={`/event/${slug ?? id}`}>{name}</CardLink>
      </Text>
      <Text fontSize="sm" color="muted" mt={1} lineClamp={1}>
        {day?.month} {day?.day} · {location?.city ?? 'Online'}
      </Text>
    </Box>
  );
};

export const Body = ({ event }) => (
  <Flex align="center" px={4} py={3} minH={`${STUB}px`} borderLeft="2px dashed" borderColor="rule">
    <Meta {...event} />
  </Flex>
);

