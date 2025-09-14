import {
  Box,
  AspectRatio,
  Image,
  IconButton,
  Spinner,
  HStack,
  Portal,
} from '@chakra-ui/react';
import {
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import SlickSlider from 'react-slick';
import { useEffect, useRef, useState } from 'react';

import ImageUploader from '../components/ImageUploader';

const HeroGallery = ({ gameId, images, currentUser, fetcher }) => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxRef = useRef(null);

  const sliderSettings = {
    arrows: false,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    pauseOnFocus: true,
  };

  const uploadingImages =
    fetcher.state === 'submitting' &&
    fetcher.submission.action.includes('images/add')
      ? fetcher.submission.formData.getAll('images').map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
        }))
      : [];

  const goTo = (index) => {
    sliderRef.current?.slickGoTo(index);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxRef.current?.slickPrev();
      if (e.key === 'ArrowRight') lightboxRef.current?.slickNext();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen) {
      lightboxRef.current?.slickGoTo(lightboxIndex);
    }
  }, [lightboxOpen, lightboxIndex]);

  return (
    <>
      <Box>
        <SlickSlider
          ref={sliderRef}
          {...sliderSettings}
          afterChange={(index) => setCurrentSlide(index)}
        >
          {images.map((image, index) => (
            <AspectRatio key={image.url} ratio={16 / 9}>
              <Image
                src={image.url}
                objectFit="cover"
                alt=""
                cursor="pointer"
                onClick={() => openLightbox(index)}
              />
            </AspectRatio>
          ))}
          {uploadingImages.map((image) => (
            <AspectRatio key={image.url} ratio={16 / 9}>
              <Image src={image.url} objectFit="cover" opacity={0.5} alt="" />
              <Spinner position="absolute" inset={0} margin="auto" size="lg" />
            </AspectRatio>
          ))}
        </SlickSlider>
      </Box>

      <HStack mt={2} spacing={2} overflowX="auto">
        {images.map((image, index) => (
          <Box key={image.url} position="relative" flex="0 0 auto">
            <AspectRatio
              ratio={16 / 9}
              w="100px"
              onClick={() => goTo(index)}
            >
              <Image
                src={image.thumbnail_url}
                objectFit="cover"
                borderRadius="md"
                cursor="pointer"
                alt=""
                border={
                  index === currentSlide ? '2px solid teal' : '2px solid transparent'
                }
              />
            </AspectRatio>
            {currentUser && !image.external && (
              <IconButton
                position="absolute"
                top={1}
                right={1}
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
        {uploadingImages.map((image) => (
          <Box key={image.url} position="relative" flex="0 0 auto">
            <AspectRatio ratio={16 / 9} w="100px">
              <Image
                src={image.url}
                objectFit="cover"
                opacity={0.5}
                borderRadius="md"
                alt=""
              />
            </AspectRatio>
            <Spinner position="absolute" inset={0} margin="auto" size="sm" />
          </Box>
        ))}
        {currentUser && (
          <Box w="100px">
            <ImageUploader
              gameId={gameId}
              currentUser={currentUser}
              fetcher={fetcher}
            />
          </Box>
        )}
      </HStack>

      <Portal>
        {lightboxOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.800"
            zIndex="modal"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={closeLightbox}
          >
            <Box
              position="relative"
              w="full"
              maxW="800px"
              onClick={(e) => e.stopPropagation()}
            >
              <SlickSlider
                ref={lightboxRef}
                {...sliderSettings}
                initialSlide={lightboxIndex}
              >
                {images.map((image) => (
                  <AspectRatio key={image.url} ratio={16 / 9}>
                    <Image src={image.url} objectFit="cover" alt="" />
                  </AspectRatio>
                ))}
              </SlickSlider>
              <IconButton
                aria-label="Previous slide"
                icon={<ChevronLeftIcon />}
                position="absolute"
                top="50%"
                left={2}
                transform="translateY(-50%)"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxRef.current?.slickPrev();
                }}
              />
              <IconButton
                aria-label="Next slide"
                icon={<ChevronRightIcon />}
                position="absolute"
                top="50%"
                right={2}
                transform="translateY(-50%)"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxRef.current?.slickNext();
                }}
              />
            </Box>
          </Box>
        )}
      </Portal>
    </>
  );
};

export default HeroGallery;

