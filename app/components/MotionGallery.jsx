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
import { FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';

import ImageUploader from '../components/ImageUploader';

const MotionGallery = ({ gameId, images, currentUser, fetcher }) => {
  const [selectedUrl, setSelectedUrl] = useState(null);

  const uploadingImages =
    fetcher.state === 'submitting' &&
    fetcher.submission.action.includes('images/add') ?
    fetcher.submission.formData.getAll('images').map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })) : [];

  return (
    <>
      <Grid
        gap={3}
        templateColumns={['repeat(1, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      >
        {images.map((image) => (
          <Box key={image.url} position="relative">
            <AspectRatio
              ratio={16 / 9}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Image
                src={image.thumbnail_url}
                borderRadius="md"
                objectFit="cover"
                size="100%"
                cursor="pointer"
                alt=""
                onClick={() => {
                  setSelectedUrl(image.url);
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
                borderRadius="full"
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
                    // { method: 'post', action: './images/delete' }
                  );
                }}
              />
            )}
          </Box>
        ))}
        {uploadingImages.map((image) => (
          <Box key={image.url} position="relative">
            <AspectRatio
              ratio={16 / 9}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Image
                src={image.url}
                borderRadius="md"
                objectFit="cover"
                size="100%"
                cursor="pointer"
                alt=""
                opacity={0.5}
                onClick={() => {
                  setSelectedUrl(image.url);
                }}
              />
            </AspectRatio>
            <Spinner
              position="absolute"
              inset={0}
              margin="auto"
              size="lg"
              pointerEvents="none"
            />
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
          inset={0}
          background="black"
          transition="opacity .5s ease-out"
          onClick={() => setSelectedUrl(null)}
          opacity={selectedUrl ? 0.5 : 0}
          visibility={selectedUrl ? 'visible' : 'hidden'}
        />

        <Box
          position="fixed"
          top="15px"
          left="15px"
          bottom="15px"
          right="15px"
          pointerEvents="none"
        >
            {selectedUrl && (
              <AspectRatio
                ratio={16 / 9}
                zIndex={10000}
                maxW="calc(100vw - 30px)"
                maxH="calc(100vh - 30px)"
              >
                <Image
                  borderRadius="md"
                  objectFit="cover"
                  size="100%"
                  src={selectedUrl}
                  alt=""
                  onClick={() => {
                    setSelectedUrl(null);
                  }}
                  cursor="pointer"
                />
              </AspectRatio>
            )}
        </Box>
      </Portal>
    </>
  );
};

export default MotionGallery;
