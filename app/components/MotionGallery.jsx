import {
  Box,
  Button,
  Image,
  AspectRatio,
  IconButton,
  Spinner,
  Stack,
} from '@chakra-ui/react';
import { LuTrash2 } from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';

import ImageUploader from '../components/ImageUploader';
import Lightbox from './Lightbox';
import lightboxTransition from '../utils/lightboxTransition';

// The strip's thumbnails are all one height, each as wide as its picture,
// within limits: a tall one is cropped at 3:5, a very wide one at 12:5.
const STRIP_HEIGHT = { base: '76px', md: '92px' };
const shapeOf = (image) => {
  const ratio = image.width && image.height ? image.width / image.height : 16 / 9;
  return Math.min(Math.max(ratio, 0.6), 2.4);
};

// The strip fades out at an end where there's more to scroll to, instead of
// cutting a thumbnail off.
const FADE = '48px';
const fadeMask = ({ start, end }) =>
  start || end
    ? `linear-gradient(to right, ${start ? `transparent, black ${FADE}` : 'black'}, ${
        end ? `black calc(100% - ${FADE}), transparent` : 'black'
      })`
    : 'none';

function useScrollEnds(ref, deps) {
  const [ends, setEnds] = useState({ start: false, end: false });
  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return undefined;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scroller;
      const start = scrollLeft > 1;
      const end = scrollLeft + clientWidth < scrollWidth - 1;
      setEnds((was) => (was.start === start && was.end === end ? was : { start, end }));
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    const resizes = new ResizeObserver(update);
    resizes.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', update);
      resizes.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ends;
}

/**
 * A game's pictures: the first large, the others in a strip under it that
 * scrolls sideways, each opening the lightbox (#350: buttons, so from the
 * keyboard too). Members describe, remove and add pictures here.
 */
const MotionGallery = ({ gameId, gameName = 'the game', images, currentUser, fetcher }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const thumbnails = useRef([]);
  const strip = useRef(null);

  const uploadingImages =
    fetcher.state === 'submitting' && fetcher.formAction?.includes('images/add')
      ? fetcher.formData.getAll('images').map((file) => ({
          name: file.name,
          url: URL.createObjectURL(file),
          uploading: true,
        }))
      : [];

  const allImages = [...images, ...uploadingImages];
  const [main, ...others] = allImages;
  const ends = useScrollEnds(strip, [allImages.length, Boolean(currentUser)]);

  const open = (index) =>
    lightboxTransition('open', () => setSelectedIndex(index), {
      from: thumbnails.current[index],
    });

  // Back into its thumbnail, scrolled into the strip first (under the
  // lightbox, out of sight) so it lands where it can be seen.
  const close = (index) => {
    const thumbnail = thumbnails.current[index];
    const scroller = strip.current;
    if (thumbnail && scroller?.contains(thumbnail)) {
      const box = thumbnail.getBoundingClientRect();
      const view = scroller.getBoundingClientRect();
      if (box.left < view.left) scroller.scrollLeft -= view.left - box.left + 12;
      else if (box.right > view.right) scroller.scrollLeft += box.right - view.right + 12;
    }
    lightboxTransition('close', () => setSelectedIndex(null), {
      to: () => thumbnails.current[index],
    });
  };

  const describe = (image, index) =>
    currentUser && !image.external && !image.uploading && (
      // #350: what it shows, for those who can't see it.
      <Button
        position="absolute"
        bottom={1.5}
        left={1.5}
        size="2xs"
        variant="subtle"
        aria-label={`Describe image ${index + 1}`}
        title={image.alt ? 'Edit the alt text' : 'Add alt text'}
        onClick={() => {
          const alt = window.prompt('What does this image show? (For people who can’t see it.)', image.alt ?? '');
          if (alt !== null) {
            fetcher.submit({ id: image.id, alt }, { method: 'post', action: `/game/${gameId}/images/alt` });
          }
        }}
      >
        {image.alt ? 'Alt ✓' : '+ Alt'}
      </Button>
    );

  const remove = (image) =>
    currentUser && !image.external && !image.uploading && (
      <IconButton
        position="absolute"
        top={1.5}
        right={1.5}
        size="2xs"
        aria-label={`Remove image ${image.id}`}
        rounded="full"
        variant="subtle"
        loading={
          fetcher.state === 'submitting' &&
          fetcher.formAction?.includes('images/delete') &&
          fetcher.formData?.get('id') === image.id
        }
        onClick={(e) => {
          e.preventDefault();
          fetcher.submit(
            { id: image.id },
            { method: 'post', action: `/game/${gameId}/images/delete` }
          );
        }}
      >
        <LuTrash2 />
      </IconButton>
    );

  const picture = (image, index, props) => (
    <Box
      as="button"
      type="button"
      display="block"
      w="100%"
      h="100%"
      aria-label={image.alt ? `${image.alt}: open` : `Open image ${index + 1} of ${gameName}`}
      cursor="zoom-in"
      borderRadius="control"
      overflow="hidden"
      bg="surface"
      _focusVisible={{ outline: '2px solid', outlineColor: 'colorPalette.focusRing', outlineOffset: '2px' }}
      onClick={() => open(index)}
    >
      <Image
        ref={(element) => {
          thumbnails.current[index] = element;
        }}
        w="100%"
        h="100%"
        objectFit="cover"
        alt={image.alt ?? ''}
        opacity={image.uploading ? 0.5 : 1}
        transition="transform 0.3s cubic-bezier(0.2, 0, 0, 1)"
        _hover={{ transform: 'scale(1.03)' }}
        {...props}
      />
    </Box>
  );

  const uploading = (image) =>
    image.uploading && (
      <Spinner position="absolute" inset={0} margin="auto" size="md" pointerEvents="none" />
    );

  return (
    <>
      <Stack gap={2}>
        {main ? (
          <Box position="relative">
            <AspectRatio ratio={16 / 9}>
              {picture(main, 0, {
                src: main.thumbnail_url || main.url,
                loading: 'eager',
                // Where a card's image moves to (view transitions, CardLink).
                'data-vt-hero': '',
                css: { viewTransitionName: 'record-image' },
              })}
            </AspectRatio>
            {uploading(main)}
            {describe(main, 0)}
            {remove(main)}
          </Box>
        ) : (
          currentUser && (
            <ImageUploader gameId={gameId} currentUser={currentUser} fetcher={fetcher} />
          )
        )}

        {(others.length > 0 || (main && currentUser)) && (
          <Box
            as="ul"
            ref={strip}
            aria-label={`More images of ${gameName}`}
            display="flex"
            gap={2}
            overflowX="auto"
            scrollSnapType="x proximity"
            scrollPaddingInline="4px"
            // Room for the focus ring, which the scrolling would cut.
            p="4px"
            m="-4px"
            css={{
              scrollbarWidth: 'thin',
              maskImage: fadeMask(ends),
              WebkitMaskImage: fadeMask(ends),
            }}
          >
            {others.map((image, i) => (
              <Box
                as="li"
                key={image.url}
                position="relative"
                flexShrink={0}
                h={STRIP_HEIGHT}
                aspectRatio={shapeOf(image)}
                scrollSnapAlign="start"
              >
                {picture(image, i + 1, {
                  src: image.thumbnail_url || image.url,
                  loading: 'lazy',
                })}
                {uploading(image)}
                {describe(image, i + 1)}
                {remove(image)}
              </Box>
            ))}
            {main && currentUser && (
              <Box as="li" flexShrink={0} h={STRIP_HEIGHT} aspectRatio={16 / 9}>
                <ImageUploader gameId={gameId} currentUser={currentUser} fetcher={fetcher} />
              </Box>
            )}
          </Box>
        )}
      </Stack>
      {selectedIndex !== null && (
        <Lightbox
          images={allImages}
          index={selectedIndex}
          onClose={close}
        />
      )}
    </>
  );
};

export default MotionGallery;
