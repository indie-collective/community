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
          borderWidth="1px"
          roundedBottom={5}
          padding={1}
          boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"
          _hover={{
            backgroundColor: colorMode === 'dark' ? 'gray.700' : 'gray.50',
            cursor: 'pointer',
          }}
          rounded={5}
        >
          <Box width="45px" mr={2} flexShrink={0} position="relative">
            <AspectRatioBox ratio={1}>
              <Image
                size="100%"
                objectFit="contain"
                src={logo && logo.thumbnail_url}
                alt="Organization cover"
                fallbackSrc={placeholder}
                roundedTop={5}
              />
            </AspectRatioBox>

            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              textAlign="center"
            >
              <DarkMode>
                <Badge
                  rounded={2}
                  variant="solid"
                  variantColor={TYPES_COLORS[type]}
                  fontSize="0.5em"
                >
                  {TYPES_ABBR[type]}
                </Badge>
              </DarkMode>
            </Box>
          </Box>

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
              {people.totalCount} people &bull; {games.totalCount} games
            </Box>
          </Box>
        </PseudoBox>
      </a>
    </Link>
  );
};

export default OrgCard;
