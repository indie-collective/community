import {
  Box,
  Image,
  Grid,
  AspectRatio,
  Link as ChakraLink,
  IconButton,
  Portal,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import ImageUploader from '../components/ImageUploader';

const MotionGallery = ({ gameId, images, currentUser, fetcher }) => {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <Grid
        gap={3}
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      >
        {images.map((image, index) => (
          <Box key={index} position="relative">
            <AspectRatio
              as={motion.div}
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
            {currentUser && !image.external && (
              <IconButton
                position="absolute"
                bottom={2}
                right={2}
                size="xs"
                aria-label={`Remove image ${image.id}`}
                isRound
                colorScheme="red"
                icon={<DeleteIcon />}
                onClick={(e) => {
                  e.preventDefault();

                  fetcher.submit(
                    { id: image.id },
                    {
                      method: 'post',
                      action: `/game/${image.id}/images/delete`,
                    }
                    // { method: 'post', action: './images/delete' }
                  );
                }}
              />
            )}
          </Box>
        ))}
        {fetcher.state === 'submitting' &&
          fetcher.submission.action.includes('images/add') &&
          fetcher.submission.formData.getAll('images').map((file) => (
            <Box key={file.name} position="relative">
              <AspectRatio ratio={16 / 9}>
                <Image
                  borderRadius="md"
                  objectFit="cover"
                  size="100%"
                  src={URL.createObjectURL(file)}
                  alt=""
                  opacity={0.5}
                />
              </AspectRatio>
              <Spinner position="absolute" inset={0} margin="auto" size="lg" />
            </Box>
          ))}
        {currentUser && (
          <ImageUploader
            gameId={gameId}
            currentUser={currentUser}
            fetcher={fetcher}
          />
        )}
      </Grid>

      <Portal>
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
      </Portal>
    </>
  );
};

export default MotionGallery;
