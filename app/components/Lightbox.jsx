import { Box, IconButton, Image } from '@chakra-ui/react';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

import lightboxTransition from '../utils/lightboxTransition';

const canTransition = () =>
  typeof document !== 'undefined' &&
  'startViewTransition' in document &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The game's pictures, one at a time, over the page. With view transitions
 * (lightboxTransition), the picture grows out of its thumbnail and slides to
 * the next; without, it fades in. React's own portal, not Chakra's: Chakra's
 * mounts a render later, after the transition has taken its picture of the
 * page. `onClose` is given the index shown, so the gallery knows which
 * thumbnail the picture goes back to.
 */
const Lightbox = ({ images, index, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // The full-size pictures loaded so far; until then, the thumbnail (already
  // there) stands in, so the picture is never blank.
  const [loaded, setLoaded] = useState(() => new Set());
  const [animate] = useState(() => !canTransition());
  // A dialog (#350): focus goes into it, and back where it was on closing.
  const closeRef = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    closeRef.current?.focus();
    return () => before?.focus?.();
  }, []);

  // The page under it doesn't scroll (nor move, as its scrollbar goes).
  useEffect(() => {
    const { style } = document.documentElement;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const before = { overflow: style.overflow, paddingRight: style.paddingRight };
    style.overflow = 'hidden';
    if (scrollbar > 0) style.paddingRight = `${scrollbar}px`;
    return () => Object.assign(style, before);
  }, []);

  const close = useCallback(() => onClose(currentIndex), [onClose, currentIndex]);

  const paginate = useCallback(
    (step) =>
      lightboxTransition(step > 0 ? 'next' : 'prev', () =>
        setCurrentIndex((current) => (current + step + images.length) % images.length)
      ),
    [images.length]
  );

  const handleNext = useCallback(() => paginate(1), [paginate]);
  const handlePrev = useCallback(() => paginate(-1), [paginate]);

  // This one and its neighbours, so going on shows them at once.
  const requested = useRef(new Set());
  useEffect(() => {
    for (const step of [0, 1, -1]) {
      const { url } = images[(currentIndex + step + images.length) % images.length];
      if (requested.current.has(url)) continue;
      requested.current.add(url);
      const preload = new window.Image();
      preload.onload = () => setLoaded((all) => new Set(all).add(url));
      preload.src = url;
    }
  }, [currentIndex, images]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, close]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // A swipe sideways goes to the next or previous picture; a click beside
  // the picture closes.
  const swipe = useRef(null);
  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerUp = (e) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && images.length > 1) {
      swipe.current.moved = true;
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };
  const onBackdropClick = (e) => {
    const swiped = swipe.current?.moved;
    swipe.current = null;
    if (!swiped && e.target === e.currentTarget) close();
  };

  const image = images[currentIndex];
  const ratio = image.width && image.height ? image.width / image.height : 16 / 9;
  const src = loaded.has(image.url) ? image.url : image.thumbnail_url || image.url;

  const control = {
    position: 'absolute',
    variant: 'ghost',
    color: 'white',
    rounded: 'full',
    _hover: { bg: 'whiteAlpha.200' },
    _focusVisible: { outline: '2px solid white', outlineOffset: '2px' },
  };

  return createPortal(
    <Box
      position="fixed"
      inset={0}
      zIndex={10000}
      bg="rgba(8, 12, 10, 0.94)"
      userSelect="none"
      overflow="hidden"
      css={{ viewTransitionName: 'lightbox-backdrop', touchAction: 'pinch-zoom' }}
      {...(animate && { animationName: 'fade-in', animationDuration: 'moderate' })}
      role="dialog"
      aria-modal="true"
      aria-label="Images"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <Box
        position="absolute"
        inset={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={onBackdropClick}
      >
        <Image
          // Keyed, so without view transitions the fade replays on each.
          key={animate ? currentIndex : undefined}
          data-lightbox-image=""
          src={src}
          alt={image.alt || `Image ${currentIndex + 1}`}
          draggable={false}
          // As large as fits, in its own shape, with room for the controls.
          w={`min(92vw, calc((100dvh - 9rem) * ${ratio}))`}
          aspectRatio={ratio}
          objectFit="contain"
          borderRadius="control"
          shadow="lift"
          css={{ viewTransitionName: 'lightbox-image' }}
          {...(animate && { animationName: 'fade-in, scale-in', animationDuration: 'moderate' })}
        />
      </Box>

      <IconButton {...control} top={4} right={4} onClick={close} ref={closeRef} aria-label="Close Lightbox">
        <LuX />
      </IconButton>
      <IconButton {...control} top={4} right={16} onClick={toggleFullscreen} aria-label="Toggle Fullscreen">
        {isFullscreen ? <FaCompress /> : <FaExpand />}
      </IconButton>

      {images.length > 1 && (
        <>
          <IconButton
            {...control}
            size="lg"
            left={{ base: 1, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            onClick={handlePrev}
            aria-label="Previous Image"
          >
            <LuChevronLeft />
          </IconButton>
          <IconButton
            {...control}
            size="lg"
            right={{ base: 1, md: 4 }}
            top="50%"
            transform="translateY(-50%)"
            onClick={handleNext}
            aria-label="Next Image"
          >
            <LuChevronRight />
          </IconButton>
          <Box
            position="absolute"
            bottom={6}
            left="50%"
            transform="translateX(-50%)"
            color="white"
            fontSize="sm"
            fontWeight="medium"
            fontVariantNumeric="tabular-nums"
            bg="blackAlpha.600"
            px={3}
            py={1}
            borderRadius="full"
            aria-live="polite"
          >
            {currentIndex + 1} / {images.length}
          </Box>
        </>
      )}
    </Box>,
    document.body
  );
};

export default Lightbox;
