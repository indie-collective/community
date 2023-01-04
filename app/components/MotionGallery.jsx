import {
  Box,
  Image,
  Grid,
  AspectRatio,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

const MotionGallery = ({ images }) => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <Grid
        gap={3}
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      >
        {images.map((image, index) => (
          <AspectRatio
            as={motion.div}
            key={index}
            ratio={16 / 9}
            layoutId={index + 1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Image
              as={motion.img}
              src={image.thumbnail_url}
              borderRadius="md"
              objectFit="cover"
              size="100%"
              cursor="pointer"
              onClick={() => {
                setSelectedId(index + 1);
              }}
            />
          </AspectRatio>
        ))}
      </Grid>

      <Box
        position="fixed"
        top={0}
        left={0}
        bottom={0}
        right={0}
        background="black"
        transition="opacity .5s ease-out"
        onClick={() => setSelectedId(0)}
        opacity={selectedId > 0 ? 0.5 : 0}
        visibility={selectedId > 0 ? 'visible' : 'hidden'}
      />

      <Box
        position="fixed"
        top="15px"
        left="15px"
        bottom="15px"
        right="15px"
        pointerEvents="none"
      >
        <AnimatePresence>
          {selectedId && (
            <AspectRatio
              as={motion.div}
              ratio={16 / 9}
              layoutId={selectedId}
              zIndex={10000}
              maxW="calc(100vw - 30px)"
              maxH="calc(100vh - 30px)"
            >
              <Image
                as={motion.img}
                borderRadius="md"
                objectFit="cover"
                size="100%"
                src={images[selectedId - 1].url}
                alt=""
                onClick={() => {
                  setSelectedId(null);
                }}
                cursor="pointer"
              />
            </AspectRatio>
          )}
        </AnimatePresence>
      </Box>
    </>
  );
};

export default MotionGallery;
