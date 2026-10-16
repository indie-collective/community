import { useId } from 'react';
import { Box, Icon } from '@chakra-ui/react';

/**
 * The map pin, as on /places and event pages: a drop in `color` (a Chakra
 * colour token), with the logo, when there's one, in its round hole.
 *
 * The colour goes on Chakra's `Icon`, which resolves the token: set on the
 * raw `<svg>`, `yellow.500` isn't a CSS colour and every pin came out the
 * same grey (#321).
 */
export default function MapPin({ color, logo, size = 48 }) {
  const mask = useId();

  return (
    <Icon asChild color={color} width={`${size}px`} height={`${size}px`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" data-testid="map-pin">
        <defs>
          <mask id={mask}>
            <rect x="0" y="0" width="480" height="480" fill="white" />
            <circle cx="240" cy="200" r="120" fill="black" />
          </mask>
        </defs>

        <path
          d="M175 429 c-63 -60 -108 -126 -126 -187 -38 -129 104 -269 235 -232 85 24 155 108 156 188 0 55 -48 141 -120 215 -36 37 -71 67 -78 67 -7 0 -38 -23 -67 -51z"
          fill="currentColor"
          mask={`url(#${mask})`}
        />
        {logo && (
          <foreignObject x="80" y="40" width="320" height="320">
            <Box
              as="img"
              src={logo.thumbnail_url}
              alt=""
              loading="lazy"
              backgroundColor="currentColor"
              objectFit="cover"
              borderRadius="50%"
              width="320px"
              height="320px"
            />
          </foreignObject>
        )}
      </svg>
    </Icon>
  );
}
