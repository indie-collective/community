import {
  Box,
  Button,
  Image,
  Grid,
  AspectRatio,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';

import ImageUploader from '../components/ImageUploader';
import Lightbox from './Lightbox';

const MotionGallery = ({ gameId, gameName = 'the game', images, currentUser, fetcher }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const uploadingImages =
    fetcher.state === 'submitting' && fetcher.formAction?.includes('images/add')
      ? fetcher.formData.getAll('images').map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          uploading: true,
        }))
      : [];

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
            {/* A button, so it opens from the keyboard too (#350). */}
            <AspectRatio ratio={16 / 9}>
              <Box
                as="button"
                type="button"
                aria-label={image.alt ? `${image.alt}: open` : `Open image ${index + 1} of ${gameName}`}
                cursor="pointer"
                borderRadius="md"
                overflow="hidden"
                _focusVisible={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '2px' }}
                onClick={() => setSelectedIndex(index)}
              >
                <Image
                  src={image.thumbnail_url || image.url}
                  borderRadius="md"
                  objectFit="cover"
                  size="100%"
                  alt={image.alt ?? ''}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  // The first image is where a card's image moves to
                  // (view transitions, CardLink).
                  {...(index === 0 && {
                    'data-vt-hero': '',
                    css: { viewTransitionName: 'record-image' },
                  })}
                  opacity={image.uploading ? 0.5 : 1}
                  transition="transform 0.2s"
                  _hover={{ transform: 'scale(1.02)' }}
                  _active={{ transform: 'scale(0.98)' }}
                />
              </Box>
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
              // #350: what it shows, for those who can't see it.
              <Button
                position="absolute"
                bottom={2}
                left={2}
                size="xs"
                variant="subtle"
                aria-label={`Describe image ${index + 1}`}
                onClick={() => {
                  const alt = window.prompt('What does this image show? (For people who can’t see it.)', image.alt ?? '');
                  if (alt !== null) {
                    fetcher.submit({ id: image.id, alt }, { method: 'post', action: `/game/${gameId}/images/alt` });
                  }
                }}
              >
                {image.alt ? 'Alt ✓' : 'Add alt text'}
              </Button>
            )}
            {currentUser && !image.external && !image.uploading && (
              <IconButton
                position="absolute"
                bottom={2}
                right={2}
                size="xs"
                aria-label={`Remove image ${image.id}`}
                rounded="full"
                colorPalette="red"
                loading={
                  fetcher.state === 'submitting' &&
                  fetcher.formAction?.includes('images/delete') &&
                  fetcher.formData?.get('id') === image.id
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
              >
                <LuTrash2 />
              </IconButton>
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
      {/* Not wrapped in Chakra's Presence: it renders nothing unless given
          `present`, so the lightbox never opened (main used framer-motion's
          AnimatePresence, which needs no prop). */}
      {selectedIndex !== null && (
        <Lightbox
          images={allImages}
          index={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
};

export default MotionGallery;
