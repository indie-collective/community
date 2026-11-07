import { Icon } from '@chakra-ui/react';

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
