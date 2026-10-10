import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

// How much of the drawer shows while it's closed, until its header is
// measured: then, the whole header.
const BLEEDING = 56;
// A drag shorter than this is a tap; longer, it opens or closes the drawer.
const DRAG_THRESHOLD = 40;

/**
 * A drawer at the bottom of the screen, for phones (ADR 0002: what MUI's
 * SwipeableDrawer did here, without MUI). Its header always shows; swipe
 * it up or tap it to open the drawer to half the screen, and swipe it down,
 * tap it or tap outside to close it. The content scrolls inside, and stays
 * mounted while the drawer is closed.
 */
function SwipeableEdgeDrawer({ header, children, isOpen, onClose }) {
  const [open, setOpen] = useState(isOpen);
  // How far the header is being dragged, in pixels (down is positive).
  const [drag, setDrag] = useState(null);
  const start = useRef(null);
  const headerRef = useRef(null);
  const [bleeding, setBleeding] = useState(BLEEDING);

  useEffect(() => {
    const element = headerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() =>
      setBleeding(Math.ceil(element.getBoundingClientRect().height))
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // isOpen changed: follow it.
    setOpen(isOpen);
  }, [isOpen]);

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  const onPointerDown = (event) => {
    start.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag(0);
  };
  const onPointerMove = (event) => {
    if (start.current !== null) setDrag(event.clientY - start.current);
  };
  const onPointerUp = (event) => {
    if (start.current === null) return;
    const moved = event.clientY - start.current;
    start.current = null;
    setDrag(null);
    if (Math.abs(moved) < DRAG_THRESHOLD) {
      if (open) close();
      else setOpen(true);
    } else if (moved < 0) {
      setOpen(true);
    } else {
      close();
    }
  };

  const closedOffset = '50dvh';
  const offset = open ? '0px' : closedOffset;
  const transform =
    drag === null
      ? `translateY(${offset})`
      : // Follow the finger, within the open and closed positions.
        `translateY(clamp(0px, calc(${offset} + ${drag}px), ${closedOffset}))`;

  return (
    <>
      {open && (
        <Box
          data-testid="drawer-backdrop"
          position="fixed"
          inset={0}
          zIndex="overlay"
          bg="blackAlpha.400"
          onClick={close}
        />
      )}
      <Box
        role="dialog"
        aria-modal={open}
        aria-label="Locations"
        position="fixed"
        left={0}
        right={0}
        bottom={0}
        height={`calc(50dvh + ${bleeding}px)`}
        zIndex="modal"
        display="flex"
        flexDirection="column"
        bg={{ base: 'white', _dark: 'gray.800' }}
        borderTopRadius="8px"
        boxShadow={open ? 'lg' : 'md'}
        transform={transform}
        transition={drag === null ? 'transform 0.25s ease-out' : 'none'}
      >
        <Box
          as="header"
          ref={headerRef}
          position="relative"
          flex="0 0 auto"
          cursor="grab"
          touchAction="none"
          userSelect="none"
          aria-expanded={open}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            start.current = null;
            setDrag(null);
          }}
        >
          <Box
            width="30px"
            height="6px"
            bg={{ base: 'gray.300', _dark: 'gray.500' }}
            borderRadius="3px"
            position="absolute"
            top="8px"
            left="calc(50% - 15px)"
          />
          {header}
        </Box>
        <Box
          flex="1 1 auto"
          minHeight={0}
          overflow="auto"
          display="flex"
          inert={open ? undefined : true}
        >
          {children}
        </Box>
      </Box>
    </>
  );
}

export default SwipeableEdgeDrawer;
