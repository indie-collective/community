import React from 'react';
import Link from 'next/link';
import {
  Box,
  Badge,
  AspectRatioBox,
  PseudoBox,
  useColorMode,
  Image,
  Flex,
  Heading,
  DarkMode,
} from '@chakra-ui/core';
import usePlaceholder from '../hooks/usePlaceholder';

const TYPES_ABBR = {
  STUDIO: 'studio',
  ASSOCIATION: 'asso.',
  ORGANIZATION: 'org.',
};

const TYPES_COLORS = {
  STUDIO: 'yellow',
  ASSOCIATION: 'green',
  ORGANIZATION: 'purple',
};

const OrgCard = ({ id, type, logo, name, people, games }) => {
  const { colorMode } = useColorMode();
  const placeholder = usePlaceholder();

  return (
    <Link href="/org/[id]" as={`/org/${id}`}>
      <a>
        <PseudoBox
          as={Flex}
          alignItems="center"
          rounded={5}
          transition="background-color 200ms ease-out"
          _hover={{
            backgroundColor: colorMode === 'dark' ? 'gray.700' : 'gray.50',
            cursor: 'pointer',
          }}
        >
          <Flex direction="column" width="60px" mr={2} flexShrink={0} position="relative">
            <Image
              size="60px"
              objectFit="cover"
              src={logo && logo.thumbnail_url}
              alt="Organization cover"
              fallbackSrc={placeholder}
              rounded={3}
            />

            <Box
              position="absolute"
              bottom={-4}
              left={0}
              right={0}
              textAlign="center"
            >
              <DarkMode>
                <Badge
                  width="100%"
                  rounded={3}
                  variant="solid"
                  variantColor={TYPES_COLORS[type]}
                  fontSize="0.5em"
                >
                  {TYPES_ABBR[type]}
                </Badge>
              </DarkMode>
            </Box>
          </Flex>

          <Box isTruncated>
            <Heading as="h3" size="xs" isTruncated>
              {name}
            </Heading>

            <Box
              color="gray.500"
              fontWeight="semibold"
              letterSpacing="wide"
              fontSize="xs"
              textTransform="uppercase"
            >
              {games.totalCount} {games.totalCount === 1 ? 'game' : 'games'}
            </Box>
          </Box>
        </PseudoBox>
      </a>
    </Link>
  );
};

export default OrgCard;
