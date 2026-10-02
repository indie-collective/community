import { Box, IconButton, Image, Portal } from '@chakra-ui/react';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';

// v2 animated with framer-motion (AnimatePresence + motion.div slide
// variants). The migration dropped framer-motion, so transitions use Chakra's
// animation props: the overlay and each image fade in.
const Lightbox = ({ images, index, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const paginate = useCallback(
    (step) =>
      setCurrentIndex(
        (current) => (current + step + images.length) % images.length
      ),
    [images.length]
  );

  const handleNext = useCallback(() => paginate(1), [paginate]);
  const handlePrev = useCallback(() => paginate(-1), [paginate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        zIndex={10000}
        bg="rgba(0, 0, 0, 0.95)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        userSelect="none"
        overflow="hidden"
        animationName="fade-in"
        animationDuration="moderate"
      >
        {/* Close Button */}
        <IconButton
          position="absolute"
          top={4}
          right={4}
          onClick={onClose}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          aria-label="Close Lightbox"
          zIndex={10002}><LuX /></IconButton>

        {/* Fullscreen Toggle */}
        <IconButton
          position="absolute"
          top={4}
          right={16}
          onClick={toggleFullscreen}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          aria-label="Toggle Fullscreen"
          zIndex={10002}>{isFullscreen ? <FaCompress /> : <FaExpand />}</IconButton>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <IconButton
              position="absolute"
              left={4}
              onClick={handlePrev}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Previous Image"
              zIndex={10002}><LuChevronLeft size={40} /></IconButton>
            <IconButton
              position="absolute"
              right={4}
              onClick={handleNext}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Next Image"
              zIndex={10002}><LuChevronRight size={40} /></IconButton>
          </>
        )}

        {/* Image Container */}
        <Box
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {/* Keyed on the index so the fade replays on every change. */}
          <Box
            key={currentIndex}
            position="absolute"
            maxWidth="90%"
            maxHeight="90%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            animationName="fade-in, scale-in"
            animationDuration="moderate"
          >
            <Image
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              maxW="100%"
              maxH="100%"
              objectFit="contain"
              draggable={false}
              boxShadow="0 20px 50px rgba(0,0,0,0.5)"
            />
          </Box>
        </Box>

        {/* Index Indicator */}
        <Box
          position="absolute"
          bottom={10}
          color="white"
          fontSize="md"
          fontWeight="bold"
          bg="blackAlpha.700"
          px={4}
          py={2}
          borderRadius="full"
          zIndex={10002}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      </Box>
    </Portal>
  );
};

export default Lightbox;
