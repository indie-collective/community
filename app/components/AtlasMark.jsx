import { Box, Icon, Image } from '@chakra-ui/react';

// Told apart by shape as well as colour, on the map and in its legend.
const MARKS = {
  studio: { color: 'brand', shape: <circle cx="12" cy="12" r="8.5" /> },
  association: {
    color: 'lilac',
    shape: <path d="M12 2.5 21.5 12 12 21.5 2.5 12z" />,
  },
  event: { color: 'coral', shape: <path d="M12 3 22 21H2z" /> },
};

/** The atlas's mark for a studio, an association or an upcoming event. */
const AtlasMark = ({ type, size = 16, ...rest }) => {
  const { color, shape } = MARKS[type] ?? MARKS.studio;
  return (
    <Icon
      asChild
      color={color}
      width={`${size}px`}
      height={`${size}px`}
      flexShrink={0}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="#10201d"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden
      >
        {shape}
      </svg>
    </Icon>
  );
};

export default AtlasMark;

/**
 * A studio, association or event with its logo (an event's cover): the
 * picture, round, in a ring of its kind's colour, with its kind's mark as a
 * badge on the corner, so the legend still reads. Without a logo, the mark.
 */
export const LogoMark = ({ type, logo, size = 28, ...rest }) => {
  const { color } = MARKS[type] ?? MARKS.studio;
  const src = logo?.thumbnail_url;
  // Without one, its mark, in the same space, so names in a list line up.
  if (!src) {
    return (
      <Box display="grid" placeItems="center" w={`${size}px`} h={`${size}px`} flexShrink={0} {...rest}>
        <AtlasMark type={type} size={Math.round(size * 0.6)} />
      </Box>
    );
  }
  const badge = Math.max(9, Math.round(size * 0.42));
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0} {...rest}>
      <Image
        src={src}
        alt=""
        loading="lazy"
        w="100%"
        h="100%"
        objectFit="cover"
        bg="surface"
        rounded="full"
        borderWidth="2px"
        borderColor={color}
        boxShadow="0 0 0 1px #10201d"
      />
      <AtlasMark
        type={type}
        size={badge}
        position="absolute"
        right={`-${Math.round(badge / 4)}px`}
        bottom={`-${Math.round(badge / 4)}px`}
      />
    </Box>
  );
};
