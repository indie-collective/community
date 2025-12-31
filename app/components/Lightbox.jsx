import {
  Box,
  IconButton,
  Image,
  Flex,
  useColorModeValue,
  Portal,
} from '@chakra-ui/react';
import {
  CloseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '50%' : '-50%',
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '50%' : '-50%',
    opacity: 0,
    scale: 0.9,
  }),
};

const Lightbox = ({ images, index, onClose }) => {
  const [[page, direction], setPage] = useState([index, 0]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = page;

  const paginate = useCallback((newDirection) => {
    setPage(([prevPage]) => {
      const nextPage = (prevPage + newDirection + images.length) % images.length;
      return [nextPage, newDirection];
    });
  }, [images.length]);

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
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        position="fixed"
        inset={0}
        zIndex={10000}
        bg="rgba(0, 0, 0, 0.95)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        userSelect="none"
        overflow="hidden"
      >
        {/* Close Button */}
        <IconButton
          position="absolute"
          top={4}
          right={4}
          icon={<CloseIcon />}
          onClick={onClose}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          aria-label="Close Lightbox"
          zIndex={10002}
        />

        {/* Fullscreen Toggle */}
        <IconButton
          position="absolute"
          top={4}
          right={16}
          icon={isFullscreen ? <FaCompress /> : <FaExpand />}
          onClick={toggleFullscreen}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          aria-label="Toggle Fullscreen"
          zIndex={10002}
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <IconButton
              position="absolute"
              left={4}
              icon={<ChevronLeftIcon w={10} h={10} />}
              onClick={handlePrev}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Previous Image"
              zIndex={10002}
            />
            <IconButton
              position="absolute"
              right={4}
              icon={<ChevronRightIcon w={10} h={10} />}
              onClick={handleNext}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              aria-label="Next Image"
              zIndex={10002}
            />
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
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              style={{
                position: 'absolute',
                maxWidth: '90%',
                maxHeight: '90%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                as={motion.img}
                src={images[currentIndex].url}
                alt={`Image ${currentIndex + 1}`}
                maxW="100%"
                maxH="100%"
                objectFit="contain"
                draggable={false}
                boxShadow="0 20px 50px rgba(0,0,0,0.5)"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </AnimatePresence>
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
