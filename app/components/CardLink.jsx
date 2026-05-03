import { Link as ChakraLink } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router';

function CardLink({ ref, ...props }) {
  return (
    <ChakraLink
      textDecoration="none"
      asChild
      lineClamp={2}
      wordBreak="break-word"
      _focus={{
        outline: 'none',
      }}
    >
      <Link
        ref={ref}
        position="static"
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
        {...props}
      />
    </ChakraLink>
  );
}

export default CardLink;
