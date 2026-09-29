import { chakra } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router';

// chakra.a, not Chakra's Link: Link's recipe colours the text with the green
// palette, and style props given to the router Link underneath never applied,
// including the ::before overlay that makes the whole card clickable.
function CardLink({ ref, ...props }) {
  return (
    <chakra.a
      asChild
      position="static"
      lineClamp={2}
      wordBreak="break-word"
      _before={{
        content: "''",
        cursor: 'inherit',
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      _focus={{
        outline: 'none',
      }}
    >
      <Link ref={ref} {...props} />
    </chakra.a>
  );
}

export default CardLink;
