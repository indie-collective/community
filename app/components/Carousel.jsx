import { IconButton, useTheme, Box, Spinner } from '@chakra-ui/react';
import React, { useState, useEffect, Children, useCallback } from 'react';
import PropTypes from 'prop-types';
import SlickSlider from 'react-slick';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
// import dynamic from 'next/dynamic'

const canUseDOM = () =>
  !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );

const enquire = canUseDOM() && require('enquire.js');

const PrevArrow = ({ onClick, className }) =>
  !className.includes('slick-disabled') && (
    <IconButton
      colorScheme="green"
      aria-label="Previous"
      fontSize="2xl"
      icon={<ChevronLeftIcon />}
      isRound
      position="absolute"
      left="-15px"
      top={0}
      bottom={0}
      margin="auto"
      zIndex={2}
      onClick={onClick}
    />
  );

const NextArrow = ({ onClick, className }) =>
  !className.includes('slick-disabled') && (
    <IconButton
      colorScheme="green"
      aria-label="Next"
      fontSize="2xl"
      icon={<ChevronRightIcon />}
      isRound
      position="absolute"
      right="-15px"
      top={0}
      bottom={0}
      margin="auto"
      onClick={onClick}
    />
  );

const Carousel = ({
  children,
  slidesToShow,
  onLoadMore,
  loadingMore,
  ...rest
}) => {
  const theme = useTheme();
  const [isClient, setIsClient] = useState(false);

  const breakpoints = Object.values(theme.breakpoints);

  // dynamic import breaks the dynamic rendering of elements
  // const SlickSlider = dynamic(import('react-slick'), {
  //   ssr: !isClient,
  // });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [breakpoint, setBreakpoint] = useState(null);

  useEffect(() => {
    const responsiveMediaHandlers = [];
    if (Array.isArray(slidesToShow)) {
      breakpoints.forEach((breakpoint, index) => {
        let query = `(min-width: ${index === 0 ? 0 : breakpoints[index - 1]})`;

        if (index < breakpoints.length - 1) {
          query += ` and (not (min-width: ${breakpoint}))`;
        }

        // when not using server side rendering
        if (canUseDOM()) {
          const handler = () => setBreakpoint(breakpoint);
          enquire.register(query, handler);
          responsiveMediaHandlers.push([query, handler]);
        }
      });
    }

    return () =>
      responsiveMediaHandlers.forEach(([query, handler]) =>
        enquire.unregister(query, handler)
      );
  }, []);

  const afterChange = useCallback(
    (currentSlideIndex) => {
      if (currentSlideIndex + newSlidesToShow === Children.count(children)) {
        onLoadMore();
      }
    },
    [onLoadMore]
  );

  let newSlidesToShow;

  const sliderBreakpoints = breakpoints.map((b, i) => {
    newSlidesToShow = slidesToShow[i] || newSlidesToShow;

    return {
      // this library is asking for pixels, so em * fontSize does the job
      breakpoint: b,
      slidesToShow: newSlidesToShow,
    };
  });

  if (breakpoint) {
    newSlidesToShow = sliderBreakpoints.find(
      (resp) => resp.breakpoint === breakpoint
    ).slidesToShow;
  }

  return (
    <Box position="relative">
      <SlickSlider
        key={isClient ? 'client' : 'server'}
        prevArrow={<PrevArrow />}
        nextArrow={<NextArrow />}
        infinite={false}
        speed={500}
        slidesToShow={newSlidesToShow}
        afterChange={afterChange}
        {...rest}
      >
        {children}
        {loadingMore && (
          <Box textAlign="center">
            <Spinner
              size="lg"
              position="absolute"
              top={0}
              bottom={0}
              margin="auto"
            />
          </Box>
        )}
      </SlickSlider>
    </Box>
  );
};

Carousel.propTypes = {
  slidesToShow: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  onLoadMore: PropTypes.func,
  loadingMore: PropTypes.bool,
};

Carousel.defaultProps = {
  slidesToShow: 1,
  onLoadMore: () => { },
  loadingMore: false,
};

export default Carousel;
