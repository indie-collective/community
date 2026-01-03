import {
  Box,
  Image,
  Grid,
  AspectRatio,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import ImageUploader from '../components/ImageUploader';
import Lightbox from './Lightbox';

const MotionGallery = ({ gameId, images, currentUser, fetcher }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const uploadingImages =
    fetcher.state === 'submitting' &&
      fetcher.submission.action.includes('images/add') ?
      fetcher.submission.formData.getAll('images').map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        uploading: true,
      })) : [];

  const allImages = [...images, ...uploadingImages];

  return (
    <>
      <Grid
        gap={3}
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      >
        {allImages.map((image, index) => (
          <Box
            key={image.url}
            position="relative"
            gridColumn={index === 0 ? '1 / -1' : 'auto'}
          >
            <AspectRatio ratio={16 / 9}>
              <Image
                as={motion.img}
                src={image.thumbnail_url || image.url}
                borderRadius="md"
                objectFit="cover"
                size="100%"
                cursor="pointer"
                alt=""
                opacity={image.uploading ? 0.5 : 1}
                onClick={() => {
                  setSelectedIndex(index);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              />
            </AspectRatio>
            {image.uploading && (
              <Spinner
                position="absolute"
                inset={0}
                margin="auto"
                size="lg"
                pointerEvents="none"
              />
            )}
            {currentUser && !image.external && !image.uploading && (
              <IconButton
                position="absolute"
                bottom={2}
                right={2}
                size="xs"
                aria-label={`Remove image ${image.id}`}
                isRound
                colorScheme="red"
                icon={<DeleteIcon />}
                isLoading={
                  fetcher.state === 'submitting' &&
                  fetcher.submission.action.includes('images/delete') &&
                  fetcher.submission.formData.get('id') === image.id
                }
                onClick={(e) => {
                  e.preventDefault();

                  fetcher.submit(
                    { id: image.id },
                    {
                      method: 'post',
                      action: `/game/${gameId}/images/delete`,
                    }
                  );
                }}
              />
            )}
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

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            images={allImages}
            index={selectedIndex}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MotionGallery;
