import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Circle,
  useColorModeValue,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Link } from '@remix-run/react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaGamepad, FaUsers, FaBuilding, FaMapMarkerAlt, FaHashtag } from 'react-icons/fa';
import { db } from '../utils/db.server';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const loader = async () => {
  const startOfYear = new Date('2025-01-01T00:00:00Z');
  const endOfYear = new Date('2025-12-31T23:59:59Z');

  const [
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags,
    topLocations,
  ] = await Promise.all([
    db.event.count({
      where: {
        starts_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.game.count({
      where: {
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
        deleted: false,
      },
    }),
    db.entity.count({
      where: {
        type: 'studio',
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.entity.count({
      where: {
        type: 'association',
        created_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    }),
    db.game_tag.groupBy({
      by: ['tag_id'],
      where: {
        game: {
          created_at: {
            gte: startOfYear,
            lte: endOfYear,
          },
        },
      },
      _count: {
        tag_id: true,
      },
      orderBy: {
        _count: {
          tag_id: 'desc',
        },
      },
      take: 5,
    }),
    db.location.findMany({
      where: {
        OR: [
          {
            entity: {
              some: {
                created_at: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
            },
          },
          {
            event: {
              some: {
                created_at: {
                  gte: startOfYear,
                  lte: endOfYear,
                },
              },
            },
          },
        ],
      },
      select: {
        city: true,
        country_code: true,
        _count: {
          select: {
            entity: true,
            event: true,
          },
        },
      },
      take: 10,
    }),
  ]);

  // Fetch tag names for topTags
  const topTagsWithNames = await Promise.all(
    topTags.map(async (t) => {
      const tag = await db.tag.findUnique({
        where: { id: t.tag_id },
        select: { name: true },
      });
      return { name: tag?.name || 'Unknown', count: t._count.tag_id };
    })
  );

  return json({
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags: topTagsWithNames,
    topLocations: topLocations.map(l => ({
      city: l.city || 'Unknown',
      country: l.country_code,
      total: l._count.entity + l._count.event
    })).sort((a, b) => b.total - a.total).slice(0, 5),
  });
};

const StatCard = ({ icon, label, value, color, delay, href }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const content = (
    <VStack spacing={4} align="start">
      <Circle size="40px" bg={`${color}.50`} color={color}>
        <Icon as={icon} />
      </Circle>
      <VStack spacing={0} align="start">
        <Text fontSize="sm" color={textColor} fontWeight="medium">
          {label}
        </Text>
        <Heading size="xl">{value}</Heading>
      </VStack>
    </VStack>
  );

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      bg={bgColor}
      p={6}
      borderRadius="xl"
      boxShadow="xl"
      borderTop="4px solid"
      borderTopColor={color}
      {...(href ? {
        as: Link,
        to: href,
        _hover: { transform: 'translateY(-5px)', transition: '0.2s' },
        cursor: 'pointer'
      } : {})}
    >
      {content}
    </MotionBox>
  );
};

const RewindPage = () => {
  const {
    eventsCount,
    gamesCount,
    studiosCount,
    associationsCount,
    topTags,
    topLocations,
  } = useLoaderData();

  const titleColor = useColorModeValue('teal.600', 'teal.300');
  const sectionBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const hasData = eventsCount > 0 || gamesCount > 0 || studiosCount > 0 || associationsCount > 0;

  if (!hasData) {
    return (
      <Box bg={sectionBg} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} textAlign="center">
          <Heading size="2xl">Rewind 2025</Heading>
          <Text fontSize="xl" color="gray.500">It looks like the year hasn't been mapped yet!</Text>
          <Text>Be the first to add an event or a studio for 2025.</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={sectionBg} minH="100vh">
      <Container maxW="container.xl" py={20}>
        <VStack spacing={20} align="stretch">
          {/* Hero Section */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            textAlign="center"
          >
            <Heading size="4xl" mb={4} bgGradient="linear(to-r, green.400, blue.500, purple.600)" bgClip="text" fontWeight="extrabold">
              Rewind 2025
            </Heading>
            <Text fontSize="2xl" color="gray.500" fontWeight="medium">
              A year of indie games, community, and growth.
            </Text>
          </MotionBox>

          {/* Main Stats */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <StatCard icon={FaCalendarAlt} label="Events Happened" value={eventsCount} color="teal" delay={0.1} href="/events" />
            <StatCard icon={FaGamepad} label="Games Created" value={gamesCount} color="blue" delay={0.2} href="/games" />
            <StatCard icon={FaBuilding} label="New Studios" value={studiosCount} color="purple" delay={0.3} href="/studios" />
            <StatCard icon={FaUsers} label="New Associations" value={associationsCount} color="orange" delay={0.4} href="/associations" />
          </SimpleGrid>

          {/* Detailed Sections */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            {/* Top Tags */}
            <MotionBox
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              bg={cardBg}
              p={8}
              borderRadius="2xl"
              boxShadow="2xl"
              overflow="hidden"
              position="relative"
            >
              <VStack align="start" spacing={6} zIndex={1} position="relative">
                <HStack>
                  <Icon as={FaHashtag} color="green.400" w={6} h={6} />
                  <Heading size="lg">Hottest Trends</Heading>
                </HStack>
                <Text color="gray.500">The most popular tags used by our community this year.</Text>

                {topTags.length > 0 ? (
                  <VStack align="stretch" w="100%" spacing={6}>
                    {topTags.map((tag, idx) => (
                      <Box key={tag.name} as={Link} to={`/games?tags=${encodeURIComponent(tag.name)}`} _hover={{ color: 'green.500' }}>
                        <Flex justify="space-between" mb={2}>
                          <Text fontWeight="bold" fontSize="md">{tag.name}</Text>
                          <Text color="green.500" fontWeight="semibold">{tag.count} games</Text>
                        </Flex>
                        <Box h="10px" bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="full">
                          <MotionBox
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(tag.count / topTags[0].count) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                            viewport={{ once: true }}
                            h="100%"
                            bgGradient="linear(to-r, teal.300, teal.500)"
                            borderRadius="full"
                          />
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text fontStyle="italic" color="gray.400">No tags recorded this year.</Text>
                )}
              </VStack>
            </MotionBox>

            {/* Top Locations */}
            <MotionBox
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              bg={cardBg}
              p={8}
              borderRadius="2xl"
              boxShadow="2xl"
            >
              <VStack align="start" spacing={6}>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="blue.400" w={6} h={6} />
                  <Heading size="lg">Expanding Horizons</Heading>
                </HStack>
                <Text color="gray.500">Cities where the indie scene was most vibrant in 2025.</Text>

                {topLocations.length > 0 ? (
                  <VStack align="stretch" w="100%" spacing={6}>
                    {topLocations.map((loc, idx) => (
                      <HStack key={idx} as={Link} to={`/search?q=${encodeURIComponent(loc.city)}`} justify="space-between" p={3} borderRadius="lg" _hover={{ bg: useColorModeValue('blue.50', 'gray.700'), color: 'blue.600' }} transition="0.2s">
                        <HStack spacing={4}>
                          <Circle size="36px" bg="blue.500" color="white" fontSize="sm" fontWeight="bold">
                            {idx + 1}
                          </Circle>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" fontSize="md">{loc.city}</Text>
                            <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wider">{loc.country}</Text>
                          </VStack>
                        </HStack>
                        <Box textAlign="right">
                          <Text fontWeight="bold" color="blue.500" fontSize="lg">{loc.total}</Text>
                          <Text fontSize="xs" color="gray.400">Activities</Text>
                        </Box>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text fontStyle="italic" color="gray.400">No geographical data recorded this year.</Text>
                )}
              </VStack>
            </MotionBox>
          </SimpleGrid>

          {/* Footer Message */}
          <Divider />
          <MotionBox
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            textAlign="center"
            py={10}
          >
            <Heading size="xl" mb={4} bgGradient="linear(to-r, teal.400, blue.500)" bgClip="text" fontWeight="bold">
              Thank you for being part of 2025!
            </Heading>
            <Text color="gray.500" fontSize="lg" maxW="2xl" mx="auto">
              This community exists because of your passion and contributions.
              Let's make 2026 even more incredible for indie game developers everywhere.
            </Text>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default RewindPage;
